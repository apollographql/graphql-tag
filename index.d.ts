import { DocumentNode } from 'graphql';

export default function gql(literals: any, ...placeholders: any[]): DocumentNode;
export function resetCaches(): void;
export function disableFragmentWarnings(): void;
