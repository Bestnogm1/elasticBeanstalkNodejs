import { Construct } from "constructs";
import { AwsCodePipeline } from "../../lib/AwsPipeline/Pipeline";

export interface PipelineLayersProps {
  applicationName?: string;
  environmentName?: string;
}
export class PipelineLayers extends Construct {
  constructor(scope: Construct, id: string, props?: PipelineLayersProps) {
    super(scope, id);
    new AwsCodePipeline(this, "Pipeline", {
      githubOwner: "zendrias",
      githubRepo: "Fresh-Start-Cleaning-Server",
      branch: "main",
      //! The connectionArn is the ARN of the CodeStar connection
      //! that you created in the AWS console
      connectionArn:
        "arn:aws:codeconnections:us-east-1:977545415063:connection/9d62ed80-e6dd-42d7-b3f5-1daba0c7d166",
      applicationName: props?.applicationName || "",
      environmentName: props?.environmentName || "",
    });
  }
}
