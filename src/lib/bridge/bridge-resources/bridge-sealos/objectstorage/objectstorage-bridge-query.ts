import { K8sApiContext } from "@/lib/k8s/k8s-api/k8s-api-schemas/k8s-api-context-schemas";
import { CustomResourceTarget } from "@/lib/k8s/k8s-api/k8s-api-schemas/req-res-schemas/req-target-schemas";
import { composeObjectFromTarget } from "../../../bridge-method/bridge-query-utils";
import { ObjectStorageObjectSchema } from "@/lib/sealos/resources/objectstorage/objectstorage-schemas/objectstorage-object-schema";

export const getObjectStorageObject = async (
  context: K8sApiContext,
  target: CustomResourceTarget
) => {
  // Test the new composeObjectFromTarget function
  const objectStorageObject = await composeObjectFromTarget(context, target);
  return objectStorageObject;
};
