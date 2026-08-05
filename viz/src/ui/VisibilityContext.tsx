import { createContext, useContext } from 'react';
import { DEFAULT_PREFS, type VisibilityPrefs } from '../visibilityPrefs';
import { PALETTES, type PaletteTokens } from './constants';

const VisibilityContext = createContext<VisibilityPrefs>(DEFAULT_PREFS);

export const VisibilityProvider = VisibilityContext.Provider;

export const useVisibilityPrefs = (): VisibilityPrefs => useContext(VisibilityContext);

export const usePalette = (): PaletteTokens => PALETTES[useVisibilityPrefs().palette];
