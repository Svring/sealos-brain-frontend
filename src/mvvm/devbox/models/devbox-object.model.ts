import { z } from "zod";
import { EnvSchema } from "@/mvvm/k8s/models/k8s-resource.model";

export const ResourceSchema = z.object({
	cpu: z.number(),
	memory: z.number(),
});

export const SshSchema = z.object({
	host: z.string(),
	port: z.number(),
	user: z.string(),
	workingDir: z.string(),
	privateKey: z.string().optional(),
});

export const PortSchema = z.object({
	number: z.number(),
	portName: z.string().optional(),
	protocol: z.string().optional(),
	serviceName: z.string().optional(),
	privateAddress: z.string().optional(),
	privateHost: z.string().optional(),
	networkName: z.string().optional(),
	host: z.string().optional(),
	publicAddress: z.string().optional(),
	customDomain: z.string().optional(),
});

const PodSchema = z.object({
	name: z.string(),
	status: z.string(),
});


export const DevboxObjectSchema = z.object({
	name: z.string(),
	id: z.string(),
	kind: z.string(),
	runtime: z.string(),
	image: z.string(),
	status: z.string(),
	resources: ResourceSchema,
	ssh: SshSchema,
	env: z.array(EnvSchema).optional(),
	ports: z.array(PortSchema),
	pods: z.array(PodSchema).optional(),
	operationalStatus: z.any().optional(),
});

export type Resource = z.infer<typeof ResourceSchema>;
export type Ssh = z.infer<typeof SshSchema>;
export type Port = z.infer<typeof PortSchema>;
export type DevboxObject = z.infer<typeof DevboxObjectSchema>;
