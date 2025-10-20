import type { NodeTypes } from "@xyflow/react";
import { ClusterNodeBlock } from "@/blocks/flow/nodes/cluster-node.block";
import { DevGroupNodeBlock } from "@/blocks/flow/nodes/dev-group-node.block";
import { DevboxNodeBlock } from "@/blocks/flow/nodes/devbox-node.block";
import { LaunchpadNodeBlock } from "@/blocks/flow/nodes/launchpad-node.block";
import { OsbNodeBlock } from "@/blocks/flow/nodes/osb-node.block";
import { NetworkNode } from "@/mvvm/flow/nodes/vms/network/network-node.vm";

const nodeTypes: NodeTypes = {
	devbox: DevboxNodeBlock,
	cluster: ClusterNodeBlock,
	launchpad: LaunchpadNodeBlock,
	objectstoragebucket: OsbNodeBlock,
	network: NetworkNode,
	devgroup: DevGroupNodeBlock,
};

export default nodeTypes;
