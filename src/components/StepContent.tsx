import React from 'react';
import styled, { injectGlobal } from 'styled-components';

import ExplainedItem from './ExplainedItem';
import StepDiff from './StepDiff';

import { Step, DiffItem } from '../types';
import { handleAnchor } from '../utils/common';

import tutureUtilities from '../utils';

interface StepContentProps {
  content: Step;
  diffItem: DiffItem | string;
}

/* tslint:disable-next-line */
const TutureWrapper = styled.div`
  max-width: 680px;
  margin-left: 320px;
`;

/* tslint:disable-next-line */
const TutureContentHeader = styled.h1`
  font-family: STSongti-SC-Bold;
  font-size: 45px;
  color: rgba(0, 0, 0, 0.84);
  margin-top: 44px;
  margin-bottom: 14px;
`;

export default class StepContent extends React.Component<StepContentProps> {
  render() {
    const { content, diffItem } = this.props;
    const { name, explain, diff, commit } = content;
    const anchorClassName = handleAnchor(name);

    return (
      <TutureWrapper id={anchorClassName}>
        <TutureContentHeader>{name}</TutureContentHeader>
        <ExplainedItem explain={explain}>
          <StepDiff diff={diff} diffItem={diffItem} commit={commit} />
        </ExplainedItem>
      </TutureWrapper>
    );
  }
}
