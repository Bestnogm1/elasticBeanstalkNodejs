import { Construct } from "constructs";
import * as elasticbeanstalk from "aws-cdk-lib/aws-elasticbeanstalk";
import * as iam from "aws-cdk-lib/aws-iam";
import { AWS3Bucket } from "../AWS3/AWS3";

export class AWSBeanStack extends Construct {
  constructor(scope: Construct, id: string) {
    super(scope, id);
    // Create an IAM role for the Elastic Beanstalk service
    // This role is used by Elastic Beanstalk to manage resources on your behalf
    const appName = "NodejsAppBackend";
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

    // Create the Instance Profile
    const ebInstanceProfile = new iam.CfnInstanceProfile(
      this,
      "ElasticBeanstalkEC2InstanceProfile",
      {
        roles: [ebEc2Role.roleName],
      }
    );

    const cfnApplication = new elasticbeanstalk.CfnApplication(
      this,
      "MyCfnApplication",
      {
        applicationName: appName,
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
      }
    );

    new elasticbeanstalk.CfnEnvironment(this, "MyCfnEnvironment", {
      applicationName: appName,
      environmentName: "NodejsAppBackend-env",
      // versionLabel: cfnAppVersion.ref,
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
