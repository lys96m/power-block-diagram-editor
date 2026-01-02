import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Chip from "@mui/material/Chip";
import Collapse from "@mui/material/Collapse";
import Divider from "@mui/material/Divider";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import { useMemo, useState } from "react";
import type { ValidationResult } from "../types/diagram";
import type { ValidationStats } from "../hooks/useValidationSummary";

type Props = {
  stats: ValidationStats;
  issues: ValidationResult[];
  labelLookup: Record<string, string>;
};

type Level = ValidationResult["level"];

const levelMeta: Record<
  Level,
  {
    label: string;
    color: string;
    Icon: typeof ErrorOutlineIcon;
    chipColor: "error" | "warning" | "info";
  }
> = {
  error: { label: "Errors", color: "error.main", Icon: ErrorOutlineIcon, chipColor: "error" },
  warn: { label: "Warnings", color: "warning.main", Icon: WarningAmberIcon, chipColor: "warning" },
  info: { label: "Info", color: "text.secondary", Icon: InfoOutlinedIcon, chipColor: "info" },
};

const ValidationPanel = ({ stats, issues, labelLookup }: Props) => {
  const grouped = useMemo(
    () =>
      issues.reduce<Record<Level, ValidationResult[]>>(
        (acc, issue) => {
          acc[issue.level].push(issue);
          return acc;
        },
        { error: [], warn: [], info: [] },
      ),
    [issues],
  );

  const [open, setOpen] = useState<Record<Level, boolean>>({
    error: grouped.error.length > 0,
    warn: grouped.warn.length > 0,
    info: grouped.error.length === 0 && grouped.warn.length === 0 && grouped.info.length > 0,
  });

  const toggle = (level: Level) => setOpen((prev) => ({ ...prev, [level]: !prev[level] }));

  const hasIssues = issues.length > 0;

  return (
    <Box>
      <Typography variant="subtitle1" fontWeight={600}>
        Validation
      </Typography>
      <Stack direction="row" spacing={1} mt={1} flexWrap="wrap" rowGap={1}>
        <Chip
          color="error"
          size="small"
          icon={<ErrorOutlineIcon fontSize="small" />}
          label={`Errors: ${stats.errors}`}
          variant={stats.errors ? "filled" : "outlined"}
        />
        <Chip
          color="warning"
          size="small"
          icon={<WarningAmberIcon fontSize="small" />}
          label={`Warnings: ${stats.warnings}`}
          variant={stats.warnings ? "filled" : "outlined"}
        />
        <Chip
          size="small"
          icon={<InfoOutlinedIcon fontSize="small" />}
          label={`Uncertain loads: ${stats.uncertainLoads}`}
          variant={stats.uncertainLoads ? "filled" : "outlined"}
        />
        <Chip size="small" label={`Nets: ${stats.nets}`} variant="outlined" />
        <Chip
          size="small"
          label={`Unassigned edges: ${stats.unassignedEdges}`}
          variant="outlined"
        />
        <Chip size="small" label={`Orphan nets: ${stats.orphanNets}`} variant="outlined" />
      </Stack>

      <Divider sx={{ my: 1.5 }} />

      {!hasIssues ? (
        <Stack direction="row" spacing={1} alignItems="center">
          <CheckCircleOutlineIcon color="success" fontSize="small" />
          <Typography variant="body2" color="success.main">
            検証エラーはありません。
          </Typography>
        </Stack>
      ) : (
        (["error", "warn", "info"] as Level[]).map((level) => {
          const items = grouped[level];
          const { label, color, Icon, chipColor } = levelMeta[level];
          return (
            <Box key={level} mb={1} data-testid={`validation-section-${level}`}>
              <Button
                onClick={() => toggle(level)}
                size="small"
                color={chipColor}
                startIcon={<Icon fontSize="small" />}
                endIcon={open[level] ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                data-testid={`validation-toggle-${level}`}
                sx={{
                  justifyContent: "space-between",
                  width: "100%",
                  color,
                  "&:hover": { backgroundColor: "action.hover" },
                }}
                disabled={items.length === 0}
              >
                <Typography variant="body2" fontWeight={600}>
                  {label} ({items.length})
                </Typography>
              </Button>
              <Collapse in={open[level]} timeout="auto" unmountOnExit>
                <List
                  dense
                  disablePadding
                  sx={{
                    maxHeight: 240,
                    overflowY: "auto",
                    borderLeft: 1,
                    borderColor: "divider",
                    pl: 1,
                    mt: 0.5,
                  }}
                >
                  {items.map((issue) => {
                    const targetLabel = issue.targetId
                      ? (labelLookup[issue.targetId] ?? issue.targetId)
                      : null;
                    return (
                      <ListItem key={issue.id} sx={{ alignItems: "flex-start", py: 0.25 }}>
                        <ListItemIcon sx={{ minWidth: 28, color }}>
                          <Icon fontSize="small" />
                        </ListItemIcon>
                        <ListItemText
                          primaryTypographyProps={{ variant: "body2" }}
                          secondaryTypographyProps={{ variant: "caption", color: "text.secondary" }}
                          primary={issue.message}
                          secondary={targetLabel ? `対象: ${targetLabel}` : undefined}
                        />
                      </ListItem>
                    );
                  })}
                </List>
              </Collapse>
            </Box>
          );
        })
      )}
    </Box>
  );
};

export default ValidationPanel;
