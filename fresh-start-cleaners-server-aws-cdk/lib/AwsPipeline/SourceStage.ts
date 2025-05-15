import { aws_codepipeline_actions } from "aws-cdk-lib";
import { Artifact } from "aws-cdk-lib/aws-codepipeline";
/**
 * Source stage for the pipeline.
 * @param props - The properties for the source stage.
 * @param props.connectionArn - The ARN of the CodeStar connection.
 * @param props.owner - The owner of the GitHub repository.
 * @param props.repo - The name of the GitHub repository.
 * @param props.branch - The branch to use for the source action.
 * @param props.output - The output artifact for the source action.
 * @param props.triggerOnPush - Whether to trigger on push events.
 */
export interface SourceStageProps {
  connectionArn: string;
  owner: string;
  repo: string;
  branch: string;
  output: Artifact;
  triggerOnPush: boolean;
  codeBuildCloneOutput: boolean;
  runOrder: number;
}

export class SourceStage extends aws_codepipeline_actions.CodeStarConnectionsSourceAction {
  constructor(stage: SourceStageProps) {
    super({
      actionName: "Source",
      output: stage.output,
      codeBuildCloneOutput: false,
      connectionArn: stage.connectionArn,
      owner: stage.owner,
      repo: stage.repo,
      branch: stage.branch,
      triggerOnPush: true,
      runOrder: stage.runOrder,
    });
  }
}
