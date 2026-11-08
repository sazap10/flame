// The opt-in label for container start/stop. Kept dependency-free so the pure
// label parser and the Docker API code share one definition.
const CONTROL_LABEL = 'flame.control';

// A container is controllable only when it carries flame.control=true (exact
// string; any other value, or the label being absent, means not controllable).
const isControlLabelSet = (labels) => labels?.[CONTROL_LABEL] === 'true';

module.exports = { CONTROL_LABEL, isControlLabelSet };
