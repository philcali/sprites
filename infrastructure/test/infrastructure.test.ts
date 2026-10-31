import * as cdk from 'aws-cdk-lib';
import * as assertions from 'aws-cdk-lib/assertions';
import { SpritesInfrastructureStack } from '../lib/infrastructure-stack';

const app = new cdk.App();
const stack = new SpritesInfrastructureStack(app, 'TestStack');

// Verify the stack synthesizes without errors
const template = assertions.Template.fromStack(stack);
