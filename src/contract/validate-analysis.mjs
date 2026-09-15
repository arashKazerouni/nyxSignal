import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import schema from '../../docs/gemini-output-schema.json' with { type: 'json' };

const ajv = new Ajv({ allErrors: true, strict: true });
addFormats(ajv);
const validateSchema = ajv.compile(schema);

const PROBABILITY_TOLERANCE = 0.001;

function semanticErrors(analysis) {
  const errors = [];
  const ids = new Set();

  for (const [index, opportunity] of analysis.opportunities.entries()) {
    if (ids.has(opportunity.prediction_id)) {
      errors.push(`opportunities[${index}].prediction_id must be unique`);
    }
    ids.add(opportunity.prediction_id);

    const { profit, flat, loss } = opportunity.probabilities;
    if (profit !== null && flat !== null && loss !== null) {
      const total = profit + flat + loss;
      if (Math.abs(total - 1) > PROBABILITY_TOLERANCE) {
        errors.push(
          `opportunities[${index}].probabilities must sum to 1.0 ± ${PROBABILITY_TOLERANCE}; received ${total}`,
        );
      }
    }

    const { low, high } = opportunity.entry_zone;
    if (low !== null && high !== null && low > high) {
      errors.push(`opportunities[${index}].entry_zone.low must not exceed high`);
    }

    const allocation = opportunity.allocation;
    if (
      allocation.recommended_percent !== null &&
      allocation.maximum_exposure_percent !== null &&
      allocation.recommended_percent > allocation.maximum_exposure_percent
    ) {
      errors.push(
        `opportunities[${index}].allocation.recommended_percent must not exceed maximum_exposure_percent`,
      );
    }
  }

  return errors;
}

export function validateAnalysis(input) {
  if (!validateSchema(input)) {
    return {
      valid: false,
      errors: validateSchema.errors.map((error) =>
        `${error.instancePath || '/'} ${error.message}`,
      ),
    };
  }

  const errors = semanticErrors(input);
  return { valid: errors.length === 0, errors };
}
