import * as ssm from "@aws-cdk/aws-ssm"
import * as cdk from "@aws-cdk/core"
import { CrossRegionParameter } from "./cross-region-parameter"

type ReferenceToResource<T> = (
  scope: cdk.Construct,
  id: string,
  reference: string,
) => T

export interface ParameterResourceProps<T> {
  /**
   * The nonce can be used to force the stack to update to check
   * for a new value.
   *
   * @default Date.now().toString()
   */
  nonce?: string
  parameterName: string
  resource: T
  resourceToReference(resource: T): string
  referenceToResource: ReferenceToResource<T>
  /**
   * List of regions that can retrieve this resource from an SSM Parameter.
   */
  regions: string[]
}

/**
 * Register SSM Parameters in other regions storing a reference to
 * a resource, which can then be resolved in the other region by
 * reading from the parameter.
 *
 * Storing the SSM Parameters in the other regions speeds up the
 * resolving of parameters, since we can use CloudFormation SSM
 * Parameters instead of custom resources.
 *
 * If the resource is in the same region, the resource will be returned
 * like normally in CDK, causing an export/import if cross-stack.
 */
export class ParameterResource<T> extends cdk.Construct {
  private readonly nonce: string
  private readonly parameterName: string
  private readonly resource: T
  private readonly referenceToResource: ReferenceToResource<T>
  private readonly regions: string[]

  constructor(
    scope: cdk.Construct,
    id: string,
    props: ParameterResourceProps<T>,
  ) {
    super(scope, id)
    this.nonce = props.nonce ?? Date.now().toString()
    this.parameterName = props.parameterName
    this.resource = props.resource
    this.referenceToResource = props.referenceToResource
    this.regions = props.regions

    const value = props.resourceToReference(props.resource)

    for (const region of props.regions) {
      new CrossRegionParameter(this, `Param${region}`, {
        name: this.parameterName,
        region,
        value,
      })
    }
  }

  /**
   * Get the resource by resolving the value from SSM Parameter Store
   * in case we are cross-region.
   */
  public get(scope: cdk.Construct, id: string): T {
    const producerRegion = cdk.Stack.of(this).region
    const consumerRegion = cdk.Stack.of(scope).region

    // Fast-path: Same region.
    if (producerRegion === consumerRegion) {
      return this.resource
    }

    if (!this.regions.includes(consumerRegion)) {
      throw new Error(
        `The region ${consumerRegion} is not registered for the parameter`,
      )
    }

    scope.node.addDependency(this)

    new cdk.CfnParameter(scope, `${id}Nonce`, {
      default: this.nonce,
    })

    const reference = ssm.StringParameter.valueForStringParameter(
      scope,
      this.parameterName,
    )
    return this.referenceToResource(scope, id, reference)
  }
}
