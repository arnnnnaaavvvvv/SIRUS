from typing import Dict, Any, Tuple, Optional, List
import pandas as pd
import numpy as np
from common_models import OrderSide
from .base_strategy import BaseStrategy


class DynamicASTStrategy(BaseStrategy):
    """
    Dynamically compiled strategy executed from visual no-code AST JSON definition.
    Supports indicator calculation, logical condition trees, and signal triggers.
    """

    def __init__(self, parameters: Dict[str, Any]):
        super().__init__(parameters)
        self.ast = parameters.get("ast", {})

    def generate_signals(self, df: pd.DataFrame) -> Tuple[Optional[OrderSide], str]:
        if df.empty or len(df) < 5:
            return None, "Insufficient data bars for AST strategy"

        df = df.copy()
        
        # Calculate dynamic indicators specified in AST
        indicators = self.ast.get("indicators", [])
        for ind in indicators:
            ind_name = ind.get("name")
            ind_type = ind.get("type", "").upper()
            params = ind.get("params", {})

            if ind_type == "SMA":
                window = int(params.get("window", 20))
                df[ind_name] = df["close"].rolling(window=window).mean()
            elif ind_type == "EMA":
                window = int(params.get("window", 20))
                df[ind_name] = df["close"].ewm(span=window, adjust=False).mean()
            elif ind_type == "RSI":
                period = int(params.get("period", 14))
                delta = df["close"].diff()
                gain = (delta.where(delta > 0, 0)).rolling(window=period).mean()
                loss = (-delta.where(delta < 0, 0)).rolling(window=period).mean()
                rs = gain / (loss.replace(0, np.nan))
                df[ind_name] = 100 - (100 / (1 + rs))
            elif ind_type == "PRICE":
                field = params.get("field", "close")
                df[ind_name] = df[field]

        # Evaluate rules
        rules = self.ast.get("rules", [])
        for rule in rules:
            target_side_str = rule.get("action", "").upper()
            target_side = OrderSide.BUY if target_side_str == "BUY" else OrderSide.SELL
            condition = rule.get("condition", {})

            is_triggered, reason = self._evaluate_condition(df, condition)
            if is_triggered:
                return target_side, f"AST_RULE_TRIGGERED ({target_side.value}): {reason}"

        return None, "No AST rules triggered"

    def _evaluate_condition(self, df: pd.DataFrame, condition: Dict[str, Any]) -> Tuple[bool, str]:
        cond_type = condition.get("type", "").upper()

        if cond_type == "AND":
            sub_conds = condition.get("conditions", [])
            reasons = []
            for sub in sub_conds:
                triggered, r = self._evaluate_condition(df, sub)
                if not triggered:
                    return False, f"AND block failed on sub-condition: {r}"
                reasons.append(r)
            return True, " AND ".join(reasons)

        elif cond_type == "OR":
            sub_conds = condition.get("conditions", [])
            for sub in sub_conds:
                triggered, r = self._evaluate_condition(df, sub)
                if triggered:
                    return True, f"OR block triggered by: {r}"
            return False, "OR block failed on all sub-conditions"

        left_var = condition.get("left")
        right_var = condition.get("right")
        right_val = condition.get("value")

        if left_var not in df.columns:
            return False, f"Indicator column '{left_var}' not computed"

        curr_left = df[left_var].iloc[-1]
        prev_left = df[left_var].iloc[-2] if len(df) > 1 else curr_left

        if right_var:
            if right_var not in df.columns:
                return False, f"Indicator column '{right_var}' not computed"
            curr_right = df[right_var].iloc[-1]
            prev_right = df[right_var].iloc[-2] if len(df) > 1 else curr_right
        else:
            curr_right = float(right_val) if right_val is not None else 0.0
            prev_right = curr_right

        if cond_type == "CROSS_ABOVE":
            triggered = (prev_left <= prev_right) and (curr_left > curr_right)
            return triggered, f"({left_var}: {prev_left:.2f} -> {curr_left:.2f}) CROSS_ABOVE ({right_var or right_val}: {prev_right:.2f} -> {curr_right:.2f})"
        elif cond_type == "CROSS_BELOW":
            triggered = (prev_left >= prev_right) and (curr_left < curr_right)
            return triggered, f"({left_var}: {prev_left:.2f} -> {curr_left:.2f}) CROSS_BELOW ({right_var or right_val}: {prev_right:.2f} -> {curr_right:.2f})"
        elif cond_type == "GREATER_THAN":
            triggered = curr_left > curr_right
            return triggered, f"({left_var}: {curr_left:.2f}) > ({right_var or right_val}: {curr_right:.2f})"
        elif cond_type == "LESS_THAN":
            triggered = curr_left < curr_right
            return triggered, f"({left_var}: {curr_left:.2f}) < ({right_var or right_val}: {curr_right:.2f})"

        return False, f"Unknown condition type: {cond_type}"


class ASTCompiler:
    """
    Compiles visual no-code JSON definition into an executable DynamicASTStrategy instance.
    """

    @staticmethod
    def compile(ast_json: Dict[str, Any]) -> DynamicASTStrategy:
        if "indicators" not in ast_json or "rules" not in ast_json:
            raise ValueError("Invalid AST schema: missing 'indicators' or 'rules' key")
        return DynamicASTStrategy(parameters={"ast": ast_json})
