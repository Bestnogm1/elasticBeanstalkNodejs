import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { PipelineLayers } from "./layers/PipelineLayers";
import { DeploymentLayers } from "./layers/DeploymentLayers";

export class ElasticBeanstalkInfraPipelineStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id);
    const beanstalkApp = new DeploymentLayers(this, "DeploymentLayers");

    new PipelineLayers(this, "PipelineStack", {
      applicationName: beanstalkApp.applicationName,
      environmentName: beanstalkApp.environmentName,
    });
  }
}
