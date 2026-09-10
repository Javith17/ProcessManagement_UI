import Box from '@mui/material/Box';

// Visual-only status chip used for the recurring click-to-advance status
// pattern (OrderDetail, Assembly, NewDashboard). Each page keeps its own
// status -> color map and click/advance logic exactly as the source page;
// this just renders it consistently.
export default function V2StatusPill(props: {
  label: string;
  color: string;
  onClick?: () => void;
  tint?: string;
}) {
  const clickable = !!props.onClick;
  return (
    <Box
      component={clickable ? 'button' : 'span'}
      onClick={props.onClick}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '3px 10px',
        borderRadius: '20px',
        fontSize: '11.5px',
        fontWeight: 700,
        border: 'none',
        color: props.color,
        backgroundColor: props.tint || `${props.color}1a`,
        cursor: clickable ? 'pointer' : 'default',
        fontFamily: 'inherit',
      }}
    >
      <Box component="span" sx={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: props.color }} />
      {props.label}
    </Box>
  );
}
