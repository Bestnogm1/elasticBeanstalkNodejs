import { Construct } from "constructs";
import * as codepipeline from "aws-cdk-lib/aws-codepipeline";
import * as codepipeline_actions from "aws-cdk-lib/aws-codepipeline-actions";
import { AwsPipelineBuildStage } from "./BuildStage";
import { Artifact } from "aws-cdk-lib/aws-codepipeline";
import { SourceStage } from "./SourceStage";

export interface AwsPipelineProps {
  githubOwner: string;
  githubRepo: string;
  branch: string;
  connectionArn: string;
  applicationName: string;
  environmentName: string;
}

export class AwsCodePipeline extends codepipeline.Pipeline {
  public sourceOutput: Artifact;
  public buildOutput: Artifact;
  constructor(scope: Construct, id: string, props: AwsPipelineProps) {
    super(scope, id, {
      pipelineName: "FreshStartCleanersNodeJsPipeline",
      pipelineType: codepipeline.PipelineType.V2,
      executionMode: codepipeline.ExecutionMode.QUEUED,
    });
    this.sourceOutput = new codepipeline.Artifact();
    this.buildOutput = new codepipeline.Artifact();
    const buildStage = new AwsPipelineBuildStage(this, "BuildStage");
    this.addStage({
      stageName: "Source",
      actions: [
        new SourceStage({
          connectionArn: props.connectionArn,
          owner: props.githubOwner,
          repo: props.githubRepo,
          branch: props.branch,
          output: this.sourceOutput,
          triggerOnPush: true,
          codeBuildCloneOutput: false,
          runOrder: 1,
        }),
      ],
    });

    this.addStage({
      stageName: "Build",
      actions: [
        new codepipeline_actions.CodeBuildAction({
          actionName: "CodeBuild",
          project: buildStage.buildProject,
          input: this.sourceOutput,
          outputs: [this.buildOutput],
        }),
      ],
    });

    this.addStage({
      stageName: "Deploy",
      actions: [
        new codepipeline_actions.ElasticBeanstalkDeployAction({
          actionName: "DeployToElasticBeanstalk",
          applicationName: props.applicationName,
          environmentName: props.environmentName,
          input: this.buildOutput,
        }),
      ],
    });
  }
}
