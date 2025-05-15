// File: routes/crm.js
import express from "express";
import multer from "multer";
import csvParser from "csv-parser";
import fs from "fs";
import path from "path";

import { CrmData } from "../models/CrmData.js";
import { Tag } from "../models/Tag.js";

const router = express.Router();

// Configure Multer for file uploads
const upload = multer({ dest: "uploads/" });

/** Utility: build a filter object from multiple columns for server-side search. */
const buildFilter = (searchParams) => {
  const filter = {};
  for (const key in searchParams) {
    if (!searchParams[key]) continue;
    filter[`data.${key}`] = { $regex: searchParams[key], $options: "i" };
  }
  return filter;
};

/**
 * @route POST /api/crm/upload-csv
 * Upload & parse CSV, store in MongoDB. Also create Tag if needed.
 * NEW: Auto-add selectedColumns to Tag.columns (type = 'text').
 */
router.post("/upload-csv", upload.single("file"), async (req, res) => {
  try {
    let { tag, selectedColumns } = req.body;
    if (typeof selectedColumns === "string") {
      selectedColumns = JSON.parse(selectedColumns);
    }

    // Ensure Tag
    let existingTag = await Tag.findOne({ name: tag });
    if (!existingTag) {
      existingTag = await Tag.create({ name: tag });
    }

    const filePath = path.resolve(req.file.path);
    const results = [];

    fs.createReadStream(filePath)
      .pipe(csvParser())
      .on("data", (row) => {
        const filteredData = {};
        selectedColumns.forEach((colName) => {
          filteredData[colName] = row[colName] || "";
        });
        results.push(filteredData);
      })
      .on("end", async () => {
        fs.unlinkSync(filePath);

        if (!results.length) {
          return res.json({ success: true, message: `No rows to import.` });
        }

        // Bulk insert
        const bulkOps = results.map((rowData) => ({
          insertOne: {
            document: {
              tag,
              data: rowData,
            },
          },
        }));
        await CrmData.bulkWrite(bulkOps);

        // AUTO-ADD these columns to Tag.columns if not already present
        let changed = false;
        for (const colName of selectedColumns) {
          if (!existingTag.columns.some((c) => c.name === colName)) {
            existingTag.columns.push({
              name: colName,
              type: "text",
              options: [],
            });
            changed = true;
          }
        }
        if (changed) {
          await existingTag.save();
        }

        return res.json({
          success: true,
          message: `${results.length} rows imported under tag: ${tag}`,
        });
      })
      .on("error", (err) => {
        fs.unlinkSync(filePath);
        return res.status(500).json({
          success: false,
          message: "Error parsing CSV.",
          error: err.toString(),
        });
      });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Something went wrong.",
      error: error.toString(),
    });
  }
});

/**
 * @route GET /api/crm/tags
 * Get all tags, including column metadata.
 */
router.get("/tags", async (req, res) => {
  try {
    const tags = await Tag.find({});
    res.json(tags);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch tags." });
  }
});

/**
 * @route GET /api/crm/data
 * Paginated CRM data for a specific tag (+ optional filters).
 */
router.get("/data", async (req, res) => {
  try {
    const { tag, page = 1, limit = 10, search, globalSearch } = req.query;
    if (!tag) {
      return res.status(400).json({ message: "Tag is required." });
    }

    let filter = { tag };
    if (search) {
      const parsedSearch = JSON.parse(search);
      const columnFilter = buildFilter(parsedSearch);
      filter = { ...filter, ...columnFilter };
    }
    if (globalSearch) {
      const regex = { $regex: globalSearch, $options: "i" };
      filter.$or = [
        { "data.firstName": regex },
        { "data.lastName": regex },
        { "data.email": regex },
      ];
    }

    const skip = (page - 1) * limit;
    const totalCount = await CrmData.countDocuments(filter);

    const data = await CrmData.find(filter)
      .skip(Number(skip))
      .limit(Number(limit))
      .sort({ createdAt: -1 });

    return res.json({
      data,
      page: Number(page),
      limit: Number(limit),
      totalCount,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to fetch data." });
  }
});

/**
 * @route PUT /api/crm/update-rows
 * Update one or multiple rows at once.
 */
router.put("/update-rows", async (req, res) => {
  try {
    const { updates } = req.body;
    if (!Array.isArray(updates)) {
      return res.status(400).json({ message: "Invalid updates array." });
    }

    const bulkOps = updates.map((u) => ({
      updateOne: {
        filter: { _id: u._id },
        update: {
          $set: Object.entries(u.data).reduce((acc, [col, val]) => {
            acc[`data.${col}`] = val;
            return acc;
          }, {}),
        },
      },
    }));

    if (bulkOps.length > 0) {
      await CrmData.bulkWrite(bulkOps);
    }
    res.json({ success: true, message: "Rows updated successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update rows." });
  }
});

/**
 * @route POST /api/crm/add-column
 * Add a new column to all rows in a specific tag.
 * Also add the column definition to Tag.columns.
 * Body: { tag, columnName, defaultValue, columnType, options? }
 */
router.post("/add-column", async (req, res) => {
  try {
    const {
      tag,
      columnName,
      defaultValue = "",
      columnType = "text",
      options = [],
    } = req.body;
    if (!tag || !columnName) {
      return res
        .status(400)
        .json({ message: "tag and columnName are required." });
    }

    // Update every CrmData row
    await CrmData.updateMany(
      { tag },
      { $set: { [`data.${columnName}`]: defaultValue } }
    );

    // Add column definition to Tag
    const existingTag = await Tag.findOne({ name: tag });
    if (!existingTag) {
      return res.status(404).json({ message: "Tag not found." });
    }

    // Prevent duplicates
    const alreadyExists = existingTag.columns.find(
      (col) => col.name === columnName
    );
    if (!alreadyExists) {
      existingTag.columns.push({
        name: columnName,
        type: columnType,
        options,
      });
      await existingTag.save();
    }

    res.json({
      success: true,
      message: "Column added successfully.",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add column." });
  }
});

/**
 * @route PUT /api/crm/column/:tag/rename
 * Rename a column for a given tag.
 * Body: { oldName, newName }
 */
router.put("/column/:tag/rename", async (req, res) => {
  try {
    const { tag } = req.params;
    const { oldName, newName } = req.body;
    if (!oldName || !newName) {
      return res.status(400).json({ message: "oldName and newName required." });
    }

    // 1) Update all CrmData for that tag
    const docs = await CrmData.find({ tag });
    for (let doc of docs) {
      const oldVal = doc.data.get(oldName) || "";
      doc.data.set(newName, oldVal);
      doc.data.delete(oldName);
      await doc.save();
    }

    // 2) Update Tag.columns
    const existingTag = await Tag.findOne({ name: tag });
    if (!existingTag) {
      return res.status(404).json({ message: "Tag not found." });
    }
    const col = existingTag.columns.find((c) => c.name === oldName);
    if (!col) {
      return res.status(404).json({ message: "Column not found in tag." });
    }
    col.name = newName;
    await existingTag.save();

    res.json({ success: true, message: "Column renamed successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to rename column." });
  }
});

/**
 * @route DELETE /api/crm/column/:tag
 * Delete a column from all data, and from Tag.columns
 * Query: ?name=columnName
 */
router.delete("/column/:tag", async (req, res) => {
  try {
    const { tag } = req.params;
    const { name: columnName } = req.query;
    if (!columnName) {
      return res
        .status(400)
        .json({ message: "columnName is required in query." });
    }

    // Remove from CrmData
    const docs = await CrmData.find({ tag });
    for (let doc of docs) {
      if (doc.data.has(columnName)) {
        doc.data.delete(columnName);
        await doc.save();
      }
    }

    // Remove from Tag.columns
    const existingTag = await Tag.findOne({ name: tag });
    if (!existingTag) {
      return res.status(404).json({ message: "Tag not found." });
    }
    existingTag.columns = existingTag.columns.filter(
      (col) => col.name !== columnName
    );
    await existingTag.save();

    res.json({ success: true, message: "Column deleted successfully." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to delete column." });
  }
});

/**
 * @route PUT /api/crm/column/:tag/options
 * Add or remove select-options for a column in Tag.columns
 * Body: { columnName, addOptions?: string[], removeOptions?: string[] }
 */
router.put("/column/:tag/options", async (req, res) => {
  try {
    const { tag } = req.params;
    const { columnName, addOptions, removeOptions } = req.body;

    const existingTag = await Tag.findOne({ name: tag });
    if (!existingTag) {
      return res.status(404).json({ message: "Tag not found." });
    }
    const col = existingTag.columns.find((c) => c.name === columnName);
    if (!col) {
      return res.status(404).json({ message: "Column not found." });
    }
    if (col.type !== "select") {
      return res.status(400).json({ message: "Column is not a select type." });
    }

    // Add options
    if (Array.isArray(addOptions)) {
      for (let opt of addOptions) {
        if (!col.options.includes(opt)) {
          col.options.push(opt);
        }
      }
    }
    // Remove options
    if (Array.isArray(removeOptions)) {
      col.options = col.options.filter((o) => !removeOptions.includes(o));
    }

    await existingTag.save();
    res.json({ success: true, message: "Select options updated." });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to update select options." });
  }
});

/**
 * @route GET /api/crm/export
 * Export data to CSV for a tag (+ optional search).
 */
router.get("/export", async (req, res) => {
  try {
    const { tag, search, globalSearch, columns } = req.query;
    if (!tag) {
      return res.status(400).json({ message: "Tag is required." });
    }

    let filter = { tag };
    if (search) {
      const parsedSearch = JSON.parse(search);
      const columnFilter = buildFilter(parsedSearch);
      filter = { ...filter, ...columnFilter };
    }
    if (globalSearch) {
      const regex = { $regex: globalSearch, $options: "i" };
      filter.$or = [
        { "data.firstName": regex },
        { "data.lastName": regex },
        { "data.email": regex },
      ];
    }

    const data = await CrmData.find(filter);
    const parsedColumns = columns ? JSON.parse(columns) : null;

    // gather columns
    let allColumns = new Set();
    if (!parsedColumns) {
      data.forEach((item) => {
        for (let key of item.data.keys()) {
          allColumns.add(key);
        }
      });
      allColumns = Array.from(allColumns);
    } else {
      allColumns = parsedColumns;
    }

    // build CSV
    let csv = allColumns.join(",") + "\n";

    data.forEach((item) => {
      const rowArr = allColumns.map((col) => {
        const val = item.data.get(col) || "";
        return `"${val.replace(/"/g, '""')}"`;
      });
      csv += rowArr.join(",") + "\n";
    });

    res.setHeader(
      "Content-Disposition",
      `attachment; filename=${tag}_export.csv`
    );
    res.set("Content-Type", "text/csv");
    return res.send(csv);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to export CSV." });
  }
});

export { router };
