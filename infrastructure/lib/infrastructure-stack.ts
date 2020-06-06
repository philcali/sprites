import * as acm from '@aws-cdk/aws-certificatemanager';
import * as route53 from '@aws-cdk/aws-route53';
import * as website from '@philcali-cdk/static-website';
import * as cdk from '@aws-cdk/core';

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

    const certificate = acm.Certificate.fromCertificateArn(this, 'PersonalWebsiteCert', this.formatArn({
      service: 'acm',
      sep: ':',
      resource: `certificate/${CERT_ID}`
    }));

    const staticWebsite = new website.StaticWebsite(this, 'SpriteWebsite', {
      domainName: `sprites.${DOMAIN_NAME}`,
      certificate,
      hostedZone
    });
  }
}
