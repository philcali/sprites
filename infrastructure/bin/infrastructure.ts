#!/usr/bin/env node
import * as cdk from '@aws-cdk/core';
import { SpritesInfrastructureStack } from '../lib/infrastructure-stack';

const app = new cdk.App();
new SpritesInfrastructureStack(app, 'SpritesInfrastructureStack');
