import { publicEnv } from "@/lib/env";
import { JsonLd } from "@/components/seo/json-ld";

export function SiteSchema(){const url=publicEnv.NEXT_PUBLIC_SITE_URL;return <JsonLd data={[{"@context":"https://schema.org","@type":"Organization","name":"HM Water Components Pvt. Ltd.","alternateName":"HM Aqua Chem","url":url,"slogan":"We Understand Water Better"},{"@context":"https://schema.org","@type":"WebSite","name":"HM Aqua Chem","url":url,"inLanguage":"en-IN","potentialAction":{"@type":"SearchAction","target":{"@type":"EntryPoint","urlTemplate":`${url}/products?q={search_term_string}`} ,"query-input":"required name=search_term_string"}}]}/>;}
