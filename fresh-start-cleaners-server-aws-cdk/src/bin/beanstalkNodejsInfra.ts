#!/usr/bin/env node
import * as cdk from "aws-cdk-lib";
import { ElasticBeanstalkInfraPipelineStack } from "../beanstalkNodejsInfraStack";

const app = new cdk.App();

new ElasticBeanstalkInfraPipelineStack(
  app,
  "ElasticBeanstalkInfraPipelineStack",
  {
    env: { region: "us-east-1" },
    stackName: "FreshStartCleanersNodeJsPipelineStack",
    description: "Elastic Beanstalk Infra Pipeline Stack",
    tags: {
      Name: "ElasticBeanstalkInfraPipelineStack",
      Project: "ElasticBeanstalkInfraPipelineStack",
      Owner: "Zena-Endrias",
    },
  }
);
