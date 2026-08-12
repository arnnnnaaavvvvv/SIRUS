from typing import Dict, Any, List, Tuple
import numpy as np
import pandas as pd


class CorrelatedRiskEngine:
    """
    Evaluates real-time portfolio correlation risk across open positions and proposed order signals.
    """

    def __init__(self, max_allowed_correlation: float = 0.85, max_portfolio_var_pct: float = 5.0):
        self.max_allowed_correlation = max_allowed_correlation
        self.max_portfolio_var_pct = max_portfolio_var_pct

    def compute_correlation_matrix(self, price_history_df: pd.DataFrame) -> pd.DataFrame:
        """
        Computes pairwise asset return correlation matrix from price history dataframe.
        DataFrame columns are asset symbols (e.g. ['BTC/USDT', 'ETH/USDT', 'AAPL', 'QQQ']).
        """
        returns_df = price_history_df.pct_change().dropna()
        if returns_df.empty:
            return pd.DataFrame()
        return returns_df.corr()

    def evaluate_proposed_trade(
        self,
        current_positions: Dict[str, float],  # symbol -> position_value ($)
        proposed_symbol: str,
        proposed_value: float,
        price_history_df: pd.DataFrame
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Validates if adding `proposed_symbol` of `proposed_value` breaches correlation or VaR caps.
        """
        if price_history_df.empty or proposed_symbol not in price_history_df.columns:
            return True, "Price history unavailable for correlation check; passed by default", {}

        symbols = list(current_positions.keys())
        if proposed_symbol not in symbols:
            symbols.append(proposed_symbol)

        sub_df = price_history_df[symbols].pct_change().dropna()
        if len(sub_df) < 10:
            return True, "Insufficient return bars for correlation matrix", {}

        corr_matrix = sub_df.corr()

        # Check pairwise correlation against open positions
        high_corr_violations = []
        for sym in current_positions.keys():
            if sym != proposed_symbol:
                corr_val = corr_matrix.loc[proposed_symbol, sym]
                if abs(corr_val) > self.max_allowed_correlation:
                    high_corr_violations.append((sym, round(float(corr_val), 2)))

        if high_corr_violations:
            violation_str = ", ".join([f"{s} (corr: {c})" for s, c in high_corr_violations])
            return False, f"RISK_CORRELATED_EXPOSURE_BREACH: {proposed_symbol} highly correlated with {violation_str}", {
                "high_correlations": high_corr_violations,
                "correlation_matrix": corr_matrix.to_dict()
            }

        # Calculate Portfolio Variance
        total_val = sum(current_positions.values()) + proposed_value
        weights = []
        for sym in symbols:
            val = current_positions.get(sym, 0.0) + (proposed_value if sym == proposed_symbol else 0.0)
            weights.append(val / total_val if total_val > 0 else 0.0)

        w = np.array(weights)
        cov_matrix = sub_df.cov().to_numpy()
        port_var = float(np.dot(w.T, np.dot(cov_matrix, w)))
        port_volatility_pct = float(np.sqrt(port_var) * np.sqrt(252) * 100)  # Annualized volatility %

        if port_volatility_pct > self.max_portfolio_var_pct * 10:  # Cap threshold
            return False, f"RISK_PORTFOLIO_VOLATILITY_EXCEEDED: Projected Volatility ({port_volatility_pct:.2f}%) exceeds limit", {
                "portfolio_volatility_pct": round(port_volatility_pct, 2)
            }

        return True, f"Passed correlation check. Projected Volatility: {port_volatility_pct:.2f}%", {
            "portfolio_volatility_pct": round(port_volatility_pct, 2),
            "correlation_matrix": corr_matrix.to_dict()
        }
