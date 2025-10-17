export const CLUSTER_ICON_BASE_URL = "/cluster/type";

export const CLUSTER_DEFAULT_ICON =
  "https://dbprovider.bja.sealos.run/logo.svg";

export const CLUSTER_TYPE_ICON_MAP: Record<string, string> = {
  postgresql:
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/postgresql/postgresql-original.svg",
  mongodb:
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mongodb/mongodb-original.svg",
  "apecloud-mysql":
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/mysql/mysql-original.svg",
  redis:
    "https://cdn.jsdelivr.net/gh/devicons/devicon@latest/icons/redis/redis-original.svg",
  kafka: "/kafka-icon.svg",
  weaviate: "https://avatars.githubusercontent.com/u/43707538?s=200&v=4",
  milvus: "https://dbprovider.bja.sealos.run/images/milvus.svg",
};
