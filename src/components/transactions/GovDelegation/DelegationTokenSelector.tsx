import { DelegationType } from '@aave/contract-helpers';
import { Box, FormControlLabel, Radio, RadioGroup, Typography } from '@mui/material';
import FormControl from '@mui/material/FormControl';
import { useEffect } from 'react';
import { FormattedNumber } from 'src/components/primitives/FormattedNumber';
import { Row } from 'src/components/primitives/Row';
import { useGovernanceTokens } from 'src/hooks/governance/useGovernanceTokens';

import { TokenIcon } from '../../primitives/TokenIcon';

export type DelegationToken = {
  address: string;
  name: string;
  amount: string;
  symbol: string;
  votingDelegatee?: string;
  propositionDelegatee?: string;
  type: DelegationTokenType;
};

export enum DelegationTokenType {
  ALL = 0,
  AAVE,
  STKAAVE,
  aAave,
}

export type DelegationTokenSelectorProps = {
  delegationTokens: DelegationToken[];
  setDelegationTokenType: (type: DelegationTokenType) => void;
  delegationTokenType: DelegationTokenType;
  delegationType: DelegationType;
  filter: boolean;
};

type TokenRowProps = {
  symbol: string[] | string;
  amount: string | number;
};

export const TokenRow: React.FC<TokenRowProps> = ({ symbol, amount }) => {
  return (
    <Row
      sx={{ alignItems: 'center', width: '100%' }}
      caption={
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {Array.isArray(symbol) ? (
            symbol.map((token, index) => (
              <>
                <TokenIcon
                  aToken={token === 'aAAVE'}
                  symbol={token === 'aAAVE' ? 'aave' : token}
                  sx={{ width: 16, height: 16 }}
                />
                <Typography variant="subheader1">{token}</Typography>
                {index < symbol.length - 1 && <Typography variant="subheader1">+</Typography>}
              </>
            ))
          ) : (
            <>
              <TokenIcon
                aToken={symbol === 'aAAVE'}
                symbol={symbol === 'aAAVE' ? 'aave' : symbol}
                sx={{ width: 16, height: 16 }}
              />
              <Typography variant="subheader1">{symbol}</Typography>
            </>
          )}
        </Box>
      }
    >
      <FormattedNumber variant="secondary14" color="text.secondary" value={amount} />
    </Row>
  );
};

const filterTokens = (
  tokens: DelegationToken[],
  delegationType: DelegationType
): DelegationToken[] => {
  if (delegationType === DelegationType.VOTING) {
    return tokens.filter((token) => token.votingDelegatee !== '');
  } else if (delegationType === DelegationType.PROPOSITION) {
    return tokens.filter((token) => token.propositionDelegatee !== '');
  }
  return tokens.filter(
    (token) => token.propositionDelegatee !== '' || token.votingDelegatee !== ''
  );
};

export const DelegationTokenSelector = ({
  delegationTokens,
  setDelegationTokenType,
  delegationTokenType,
  delegationType,
  filter,
}: DelegationTokenSelectorProps) => {
  const {
    data: { aave, stkAave, aAave },
  } = useGovernanceTokens();

  const filteredTokens = filter ? filterTokens(delegationTokens, delegationType) : delegationTokens;
  const isOneLiner = filter && filteredTokens.length === 1;

  useEffect(() => {
    if (isOneLiner) setDelegationTokenType(filteredTokens[0].type);
  }, [isOneLiner, filteredTokens, setDelegationTokenType]);

  if (isOneLiner) {
    return <TokenRow symbol={filteredTokens[0].symbol} amount={filteredTokens[0].amount} />;
  }

  return (
    <FormControl variant="standard" fullWidth sx={{ mb: 6 }}>
      <RadioGroup
        value={delegationTokenType}
        onChange={(e) =>
          setDelegationTokenType(Number(e.target.value) as unknown as DelegationTokenType)
        }
      >
        <FormControlLabel
          value={DelegationTokenType.ALL}
          control={<Radio size="small" />}
          componentsProps={{ typography: { width: '100%' } }}
          label={
            <TokenRow
              symbol={['AAVE', 'stkERGON', 'aAAVE']}
              amount={Number(aave) + Number(stkAave) + Number(aAave)}
            />
          }
          data-cy={`delegate-token-both`}
        />
        <FormControlLabel
          value={DelegationTokenType.AAVE}
          control={<Radio size="small" />}
          componentsProps={{ typography: { width: '100%' } }}
          label={<TokenRow symbol="AAVE" amount={aave} />}
          data-cy={`delegate-token-AAVE`}
        />
        <FormControlLabel
          value={DelegationTokenType.STKAAVE}
          control={<Radio size="small" />}
          componentsProps={{ typography: { width: '100%' } }}
          label={<TokenRow symbol="stkERGON" amount={stkAave} />}
          data-cy={`delegate-token-stkERGON`}
        />
        <FormControlLabel
          value={DelegationTokenType.aAave}
          control={<Radio size="small" />}
          componentsProps={{ typography: { width: '100%' } }}
          label={<TokenRow symbol="aAAVE" amount={aAave} />}
          data-cy={`delegate-token-aAave`}
        />
      </RadioGroup>
    </FormControl>
  );
};
