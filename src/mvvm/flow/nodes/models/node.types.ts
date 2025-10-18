import type { NodeTypes } from "@xyflow/react";
import { ClusterNode } from "../vms/cluster/cluster-node.vm";
import { DevboxNode } from "../vms/devbox/devbox-node.vm";
import { DevGroupNode } from "../vms/group/dev-group-node.vm";
import { LaunchpadNode } from "../vms/launchpad/launchpad-node.vm";
import { NetworkNode } from "../vms/network/network-node.vm";
import { OsbNode } from "../vms/osb/osb-node.vm";

const nodeTypes: NodeTypes = {
	devbox: DevboxNode,
	cluster: ClusterNode,
	launchpad: LaunchpadNode,
	objectstoragebucket: OsbNode,
	network: NetworkNode,
	devgroup: DevGroupNode,
};

export default nodeTypes;
