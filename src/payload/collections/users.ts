import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  admin: {
    useAsTitle: "username",
  },
  auth: {
    loginWithUsername: {
      allowEmailLogin: true, // default: false
      requireEmail: false, // default: false
    },
  },
  fields: [
    {
      name: "kubeconfig",
      type: "text",
      required: true,
    },
    {
      name: "appToken",
      type: "text",
    },
    {
      name: "baseUrl",
      type: "text",
    },
    {
      name: "apiKey",
      type: "text",
    },
  ],
};
