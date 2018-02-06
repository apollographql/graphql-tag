import { DocumentNode } from 'graphql';

export default function gql(template: TemplateStringsArray, ...substitutions: any[]): DocumentNode;
export function resetCaches(): void;
export function disableFragmentWarnings(): void;
