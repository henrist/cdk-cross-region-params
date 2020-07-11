# CDK Constructs for cross-region SSM Parameters and resources

## Usage

```bash
npm install @henrist/cdk-cross-region-params
```

See the individual constructs for details:

* [CrossRegionParameter](./src/cross-region-parameter.ts) - Store a SSM
  Parameter in another region.
* [ParameterReader](./src/parameter-reader.ts) - Read SSM Parameter as part of
  CloudFormation deployment, with support for cross-region lookup.
* [ParameterResource](./src/parameter-resource.ts) - Define a resource
  to be available for lookup from another region.
