function OverageTable() {
  return (
    <div className="mt-12">
      <h4 className="text-xl font-semibold">Elastic usage & success rails</h4>
      <p className="text-neutral-600 mt-1">
        Pay only when value is created. Overage resets monthly.
      </p>
      <div className="mt-4 overflow-hidden rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50">
            <tr>
              <th className="text-left p-3">Meter</th>
              <th className="text-left p-3">Included</th>
              <th className="text-left p-3">Overage</th>
              <th className="text-left p-3">Notes</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t">
              <td className="p-3">AI credits (tokens)</td>
              <td className="p-3">5k / 50k / custom</td>
              <td className="p-3">€0.0002 / token</td>
              <td className="p-3">Elastic with model mix</td>
            </tr>
            <tr className="border-t">
              <td className="p-3">Matches computed</td>
              <td className="p-3">250 / 2,500 / custom</td>
              <td className="p-3">€0.90 / match</td>
              <td className="p-3">Explain-why-matched included</td>
            </tr>
            <tr className="border-t">
              <td className="p-3">Enrich & verify</td>
              <td className="p-3">Tier-capped</td>
              <td className="p-3">€0.25 / record</td>
              <td className="p-3">Clay Explorer & sources blend</td>
            </tr>
            <tr className="border-t">
              <td className="p-3">Success fee (optional)</td>
              <td className="p-3">—</td>
              <td className="p-3">0.5%–2% of realized</td>
              <td className="p-3">Stripe Connect rails</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
