import { App, Stack } from "aws-cdk-lib"
import "jest-cdk-snapshot"
import { CrossRegionParameter } from "./cross-region-parameter"

test("cross-region-ssm-parameter", () => {
  const app = new App()
  const stack1 = new Stack(app, "Stack1", {
    env: {
      region: "us-east-1",
    },
  })

  new CrossRegionParameter(stack1, "Param", {
    name: "/param/name",
    region: "eu-west-1",
    value: "some value",
  })

  expect(stack1).toMatchCdkSnapshot({
    ignoreAssets: true,
  })
})
