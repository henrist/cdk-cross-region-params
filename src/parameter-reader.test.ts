import { CfnParameter, ParameterType } from "@aws-cdk/aws-ssm"
import { App, Stack } from "@aws-cdk/core"
import "jest-cdk-snapshot"
import { ParameterReader } from "./parameter-reader"

test("ssm-parameter-reader", () => {
  const app = new App()
  const stack1 = new Stack(app, "Stack1")
  const parameterName = "/my/param"

  new CfnParameter(stack1, "Param", {
    type: ParameterType.STRING,
    name: parameterName,
    value: "test",
  })

  const stack2 = new Stack(app, "Stack2")
  const reader = new ParameterReader(stack2, "ParamReader", {
    parameterName,
    region: "eu-west-1",
    nonce: "123",
  })

  expect(reader.parameterValue).toContain("Token")
  expect(stack2).toMatchCdkSnapshot({
    ignoreAssets: true,
  })
})
