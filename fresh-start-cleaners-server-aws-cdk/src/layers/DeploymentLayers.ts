import { Construct } from "constructs";
import * as elasticbeanstalk from "aws-cdk-lib/aws-elasticbeanstalk";
import * as iam from "aws-cdk-lib/aws-iam";

export class DeploymentLayers extends Construct {
  public readonly applicationName: string;
  public readonly environmentName: string;

  constructor(scope: Construct, id: string) {
    super(scope, id);

    this.applicationName = "FreshStartCleanersBeanstalkServer";
    this.environmentName = "FreshStartCleanersProd-env";

    const ebServiceRole = new iam.Role(this, "ElasticBeanstalkServiceRole", {
      assumedBy: new iam.ServicePrincipal("elasticbeanstalk.amazonaws.com"),
    });

    const ebEc2Role = new iam.Role(this, "ElasticBeanstalkEC2Role", {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName(
          "AWSElasticBeanstalkWebTier"
        ),
      ],
    });

    ebServiceRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "AWSElasticBeanstalkManagedUpdatesCustomerRolePolicy"
      )
    );
    ebServiceRole.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName(
        "service-role/AWSElasticBeanstalkEnhancedHealth"
      )
    );

    const ebInstanceProfile = new iam.CfnInstanceProfile(
      this,
      "ElasticBeanstalkEC2InstanceProfile",
      {
        roles: [ebEc2Role.roleName],
      }
    );

    new elasticbeanstalk.CfnApplication(this, "MyCfnApplication", {
      applicationName: this.applicationName,
      description: "My Elastic Beanstalk Application",
      resourceLifecycleConfig: {
        serviceRole: ebServiceRole.roleArn,
        versionLifecycleConfig: {
          maxAgeRule: {
            deleteSourceFromS3: false,
            enabled: false,
            maxAgeInDays: 123,
          },
          maxCountRule: {
            deleteSourceFromS3: false,
            enabled: false,
            maxCount: 123,
          },
        },
      },
    });

    new elasticbeanstalk.CfnEnvironment(this, "MyCfnEnvironment", {
      applicationName: this.applicationName,
      environmentName: this.environmentName,
      description: "My Elastic Beanstalk Environment",
      solutionStackName: "64bit Amazon Linux 2023 v6.5.1 running Node.js 20",
      optionSettings: [
        {
          namespace: "aws:elasticbeanstalk:environment",
          optionName: "EnvironmentType",
          value: "SingleInstance",
        },
        {
          namespace: "aws:autoscaling:launchconfiguration",
          optionName: "IamInstanceProfile",
          value: ebInstanceProfile.ref,
        },
        {
          namespace: "aws:elasticbeanstalk:environment",
          optionName: "ServiceRole",
          value: ebServiceRole.roleArn,
        },
      ],
    });
  }
}
