import { Construct } from "constructs";
import * as codebuild from "aws-cdk-lib/aws-codebuild";
import * as iam from "aws-cdk-lib/aws-iam";
import * as logs from "aws-cdk-lib/aws-logs";
import * as cdk from "aws-cdk-lib";

export class AwsPipelineBuildStage extends Construct {
  public buildStageLogGroup: logs.LogGroup;
  public buildProject: codebuild.Project;
  constructor(scope: Construct, id: string, props?: {}) {
    super(scope, id);
    // Create a role for CodeBuild
    const role = new iam.Role(this, "ElasticBeanstalkCodeBuildServiceRole", {
      assumedBy: new iam.ServicePrincipal("codebuild.amazonaws.com"),
      roleName: "ElasticBeanstalkBuildServiceRole",
      description: "Role for CodeBuild project",
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "AWSCodeBuildDeveloperAccess"
        ),
      ],
    });

    this.buildStageLogGroup = new logs.LogGroup(
      this,
      "ElasticBeanstalkBuildLogGroup",
      {
        retention: logs.RetentionDays.ONE_DAY, // optional
        removalPolicy: cdk.RemovalPolicy.DESTROY,
      }
    );

    this.buildProject = new codebuild.PipelineProject(
      this,
      "ElasticBeanstalkBuildProject",
      {
        projectName: "Elastic-Beanstalk-Build-Project",
        buildSpec: codebuild.BuildSpec.fromSourceFilename("buildspec.yml"),
        environment: {
          computeType: codebuild.ComputeType.LAMBDA_1GB,
          buildImage: codebuild.LinuxLambdaBuildImage.AMAZON_LINUX_2023_NODE_20,
        },
        role: role,
        logging: {
          cloudWatch: {
            enabled: true,
            logGroup: this.buildStageLogGroup,
            prefix: "BeanstalkBuildLogs",
          },
        },
      }
    );
    // this delete the role when the stack is deleted
    (role.node.defaultChild as cdk.CfnResource).applyRemovalPolicy(
      cdk.RemovalPolicy.DESTROY
    );
  }
}
