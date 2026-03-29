// Берем ядро из новой сгенерированной папки
import { OpenAPI } from "@/lib/api-generated/core/OpenAPI";

OpenAPI.BASE =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080/api/v1";

export * from "@/lib/api-generated";
