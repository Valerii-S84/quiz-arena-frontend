import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { WizardModal } from './app/(public)/_components/contact-wizard-shared';

const htmlOpen = renderToStaticMarkup(
  React.createElement(WizardModal, {
    title: 'Test',
    open: true,
    onClose() {},
    children: React.createElement('p', null, 'body'),
  }),
);
const htmlClosed = renderToStaticMarkup(
  React.createElement(WizardModal, {
    title: 'Test',
    open: false,
    onClose() {},
    children: React.createElement('p', null, 'body'),
  }),
);
console.log('OPEN START');
console.log(htmlOpen.slice(0, 500));
console.log('CLOSED START');
console.log(htmlClosed.slice(0, 500));
