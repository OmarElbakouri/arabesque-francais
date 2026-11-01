export interface AllowanceInfo {
  remaining: number;
  limit: number;
  used?: number;
  dailyRemaining?: number;
  dailyLimit?: number;
  message?: string;
}

export function AllowanceStatus({ info }: { info: AllowanceInfo }) {
  return <div className="text-sm text-muted-foreground space-y-1">
    <p>{info.remaining === -1 ? 'Allocation illimitée' : `${info.remaining} utilisations restantes sur ${info.limit}`} · sans expiration</p>
    {info.dailyLimit !== undefined && <p>{info.dailyRemaining} sur {info.dailyLimit} disponibles aujourd’hui · réinitialisation à minuit, heure de Casablanca</p>}
  </div>;
}
