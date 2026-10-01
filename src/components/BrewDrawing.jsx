import {
  AeroPressDrawing,
  ColdBrewDrawing,
  EspressoDrawing,
  FrenchPressDrawing,
  MokaPotDrawing,
  PourOverDrawing,
} from './Icons';

/**
 * src/data/brewing.js names each recipe's illustration rather than importing
 * it, so that the file stays loadable by Node at build time. This is where the
 * name becomes a component.
 */
const DRAWINGS = {
  PourOverDrawing,
  AeroPressDrawing,
  FrenchPressDrawing,
  MokaPotDrawing,
  ColdBrewDrawing,
  EspressoDrawing,
};

export default function BrewDrawing({ name, ...rest }) {
  const Drawing = DRAWINGS[name];
  return Drawing ? <Drawing {...rest} /> : null;
}
