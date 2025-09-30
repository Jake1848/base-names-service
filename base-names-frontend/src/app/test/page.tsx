import { TestMinting } from '@/components/test-minting';

export default function TestPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🧪 Domain Registration Testing</h1>
        <p className="text-muted-foreground">
          Test the domain minting process safely without spending real ETH.
          This page analyzes contracts, pricing, and revenue flow.
        </p>
      </div>

      <TestMinting />
    </div>
  );
}