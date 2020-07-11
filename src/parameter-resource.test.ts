import { Bucket } from "@aws-cdk/aws-s3"
import { App, Stack } from "@aws-cdk/core"
import "jest-cdk-snapshot"
import { ParameterResource } from "./parameter-resource"

test("ssm-parameter-backed-resource in same region", () => {
  const app = new App()
  const stack1 = new Stack(app, "Stack1", {
    env: {
      region: "eu-west-1",
    },
  })

  const bucket = new Bucket(stack1, "Bucket")
  const s = new ParameterResource(stack1, "BucketParam", {
    nonce: "123",
    parameterName: "/my-param",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    referenceToResource: Bucket.fromBucketName,
    resource: bucket,
    resourceToReference: (resource) => resource.bucketName,
    regions: ["eu-central-1", "us-east-1"],
  })

  const stack2 = new Stack(app, "Stack2", {
    env: {
      region: "eu-west-1",
    },
  })

  s.get(stack2, "Bucket")

  expect(stack1).toMatchCdkSnapshot()
  expect(stack2).toMatchCdkSnapshot()
})

test("ssm-parameter-backed-resource in different region", () => {
  const app = new App()
  const stack1 = new Stack(app, "Stack1", {
    env: {
      region: "eu-west-1",
    },
  })

  const bucket = new Bucket(stack1, "Bucket")
  const s = new ParameterResource(stack1, "BucketParam", {
    nonce: "123",
    parameterName: "/my-param",
    // eslint-disable-next-line @typescript-eslint/unbound-method
    referenceToResource: Bucket.fromBucketName,
    resource: bucket,
    resourceToReference: (resource) => resource.bucketName,
    regions: ["eu-central-1"],
  })

  const stack2 = new Stack(app, "Stack2", {
    env: {
      region: "eu-central-1",
    },
  })

  s.get(stack2, "Bucket")

  expect(stack1).toMatchCdkSnapshot()
  expect(stack2).toMatchCdkSnapshot()
})
