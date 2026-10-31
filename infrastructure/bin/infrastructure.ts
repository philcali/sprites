#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { SpritesInfrastructureStack } from '../lib/infrastructure-stack';

const app = new cdk.App();
new SpritesInfrastructureStack(app, 'SpritesInfrastructureStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT || 'YOUR_ACCOUNT_ID',
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1'
  }
});
