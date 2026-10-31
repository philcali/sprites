import * as acm from 'aws-cdk-lib/aws-certificatemanager';
import * as route53 from 'aws-cdk-lib/aws-route53';
import * as route53Targets from 'aws-cdk-lib/aws-route53-targets';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as origins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cloudfrontActions from 'aws-cdk-lib/aws-cloudfront-origins';
import * as cdk from 'aws-cdk-lib';

const DOMAIN_NAME = 'philcali.me';
const ZONE_ID = 'ZI7HL5YZ6FD32';
const CERT_ID = '2bb9cc4e-cc87-4fb8-aa7e-c5888c0110aa';

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

    // S3 bucket for static content
    const bucket = new s3.Bucket(this, 'SpriteBucket', {
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      encryption: s3.BucketEncryption.S3_MANAGED,
      versioned: false,
      lifecycleRules: [
        {
          // Clean up old versions if versioning is enabled later
          noncurrentVersionExpiration: cdk.Duration.days(90)
        }
      ]
    });

    // CloudFront OAI for secure S3 access
    const oai = new cloudfront.OriginAccessIdentity(this, 'SpriteOAI');
    bucket.grantRead(oai);

    // CloudFront distribution
    const distribution = new cloudfront.Distribution(this, 'SpriteDistribution', {
      comment: 'Sprite Creator static site',
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html'
        },
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html'
        }
      ],
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
      domainNames: [`sprites.${DOMAIN_NAME}`],
      certificate,
      defaultBehavior: {
        origin: new origins.S3Origin(bucket, {
          originAccessIdentity: oai
        }),
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        allowedMethods: cloudfront.AllowedMethods.ALLOW_GET_HEAD,
        cachePolicy: cloudfront.CachePolicy.CACHING_OPTIMIZED,
        responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.CORS_ALLOW_ALL_ORIGINS,
      },
      additionalBehaviors: {
        '/api/*': {
          origin: new origins.S3Origin(bucket),
          viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
          cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        }
      }
    });

    // Route53 A record pointing to CloudFront
    new route53.ARecord(this, 'SpriteAliasRecord', {
      zone: hostedZone,
      target: route53.RecordTarget.fromAlias(
        new route53Targets.CloudFrontTarget(distribution)
      ),
      recordName: `sprites.${DOMAIN_NAME}`
    });

    // Output the bucket and distribution for reference
    new cdk.CfnOutput(this, 'BucketName', { value: bucket.bucketName });
    new cdk.CfnOutput(this, 'DistributionId', { value: distribution.distributionId });
    new cdk.CfnOutput(this, 'DistributionDomainName', { value: distribution.domainName });
  }
}
