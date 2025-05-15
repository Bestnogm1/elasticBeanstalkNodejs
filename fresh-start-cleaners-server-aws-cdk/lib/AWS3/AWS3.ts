import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { aws_s3express as s3express } from "aws-cdk-lib";
import { Bucket } from "aws-cdk-lib/aws-s3";

interface bucketData {
  bucketName?: string;
}

export class AWS3Bucket extends Bucket {
  constructor(scope: Construct, id: string, props: bucketData) {
    super(scope, id, {
      bucketName: props.bucketName,
      removalPolicy: cdk.RemovalPolicy.DESTROY,
      autoDeleteObjects: true,
    });
  }
}
