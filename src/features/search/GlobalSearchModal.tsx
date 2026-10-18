'use client';

import React from 'react';
import { SearchOverlay, SearchOverlayProps } from './SearchOverlay';

export type GlobalSearchModalProps = SearchOverlayProps;

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = (props) => {
  return <SearchOverlay {...props} />;
};

export default GlobalSearchModal;
