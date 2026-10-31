import * as path from 'path';
import { Construct } from 'constructs';
import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as s3deploy from 'aws-cdk-lib/aws-s3-deployment';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as cdk from 'aws-cdk-lib';

const DOMAIN_NAME = 'philcali.me';
const ZONE_ID = 'ZI7HL5YZ6FD32';
const CERT_ID = '2bb9cc4e-cc87-4fb8-aa7e-c5888c0110aa';

export interface StaticWebsiteProps {
  readonly domainName: string;
  readonly certificate: acm.ICertificate;
  readonly hostedZone: route53.IHostedZone;
}

export class StaticWebsite extends Construct {
  readonly content: s3.IBucket;
  readonly distribution: cloudfront.IDistribution;
  readonly recordSet: route53.IRecordSet;

  constructor(scope: Construct, id: string, props: StaticWebsiteProps) {
    super(scope, id);

    // Logical ID: SpriteWebsite/StaticWebsite (preserves existing S3 bucket)
    this.content = new s3.Bucket(this, 'StaticWebsite', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: false,
      lifecycleRules: [
        { noncurrentVersionExpiration: cdk.Duration.days(90) }
      ]
    });

    // OAC will replace the old OAI (acceptable per user — Lambda/OAI can be destroyed)
    const oac = new cloudfront.S3OriginAccessControl(this, 'OAC', {
      originAccessControlName: cdk.Names.uniqueResourceName(this, { maxLength: 63 }),
    });

    // CloudFront distribution — logical ID: SpriteWebsite/StaticWebsiteCDN/CFDistribution (preserves existing distribution)
    const cdn = new Construct(this, 'StaticWebsiteCDN');
    this.distribution = new cloudfront.Distribution(cdn, 'CFDistribution', {
      comment: 'Sprite Creator static site',
      defaultRootObject: 'index.html',
      errorResponses: [
        { httpStatus: 403, responseHttpStatus: 200, responsePagePath: '/index.html' },
        { httpStatus: 404, responseHttpStatus: 200, responsePagePath: '/index.html' }
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      domainNames: [props.domainName],
      certificate: props.certificate,
      defaultBehavior: {
        origin: origins.S3BucketOrigin.withOriginAccessControl(this.content, {
          originAccessControl: oac,
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS,
      }
    });

    // Logical ID: SpriteWebsite/StaticWebsiteCNAME (preserves existing Route53 record)
    this.recordSet = new route53.ARecord(this, 'StaticWebsiteCNAME', {
      zone: props.hostedZone,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(this.distribution)
      ),
      recordName: props.domainName
    });
  }
}

export class SpritesInfrastructureStack extends cdk.Stack {
  constructor(scope: cdk.App, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const hostedZone = route53.HostedZone.fromHostedZoneAttributes(this, 'PersonalHZ', {
      hostedZoneId: ZONE_ID,
      zoneName: DOMAIN_NAME
    });

    const certificate = acm.Certificate.fromCertificateArn(this, 'PersonalWebsiteCert',
      `arn:aws:acm:us-east-1:${process.env.CDK_DEFAULT_ACCOUNT || 'YOUR_ACCOUNT_ID'}:certificate/${CERT_ID}`
    );

    // StaticWebsite preserves the original logical hierarchy (SpriteWebsite/...)
    // so existing deployed resources stay in-place.
    const staticWebsite = new StaticWebsite(this, 'SpriteWebsite', {
      domainName: `sprites.${DOMAIN_NAME}`,
      certificate,
      hostedZone
    });

    // Deploy the built creator app to the S3 bucket
    new s3deploy.BucketDeployment(this, 'DeployWebsite', {
      sources: [s3deploy.Source.asset(path.join(__dirname, '../../creator/dist'))],
      destinationBucket: staticWebsite.content,
      destinationKeyPrefix: 'static',
      prune: true,
    });

    // Output for reference
    new cdk.CfnOutput(this, 'BucketName', { value: staticWebsite.content.bucketName });
    new cdk.CfnOutput(this, 'DistributionId', { value: staticWebsite.distribution.distributionId });
    new cdk.CfnOutput(this, 'DistributionDomainName', { value: staticWebsite.distribution.distributionDomainName });
  }
}
