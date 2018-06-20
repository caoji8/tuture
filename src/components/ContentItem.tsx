import React from 'react';
import styled from 'styled-components';

import DiffView from './DiffView/';

import { Diff, Hunk } from '../types/';
import parseDiff from '../utils/parseDiff';
import tutureUtilities from '../utils/';

import up from './img/up.svg';
import down from './img/down.svg';

interface renderExplainFunc {
  (explain: string | string[]): React.ReactNode | React.ReactNodeArray;
}

interface ContentItemProps {
  diff: Diff[];
  commit: string;
  viewType: string;
  renderExplain: renderExplainFunc;
}

export interface File {
  oldPath: string;
  newPath: string;
  type: string;
  oldRevision: string;
  newRevision: string;
  hunks: Hunk[];
}

interface ContentItemState {
  diffText: string;
  collapseObj: CollapseObj;
  diff: Diff[];
  files: File[];
}

interface CollapseObj {
  [index: string]: boolean;
}

interface ResObj {
  [index: string]: Diff[] | File[];
}

const Image = styled.img`
  width: 10px;
`;

export default class ContentItem extends React.Component<ContentItemProps, ContentItemState> {
  constructor(props: ContentItemProps) {
    super(props);
    this.state = {
      diffText: '',
      collapseObj: {},
      diff: [],
      files: [],
    };
  }

  async setDiffAndFiles(commit: string, diff: Diff[]): Promise<void> {
    try {
      const that = this;
      const response = await fetch(`diff/${commit}.diff`);
      const diffText = await response.text();
      let files: File[] = [];

      if (diffText) {
        files = parseDiff(diffText);
      }

      that.setState({
        files,
        diff,
      });
    } catch (err) {
      // silent failed
    }
  }

  getCollapseObj = (arr: Diff[]): CollapseObj => {
    // write a new func for reduce repeat work
    let constructNewCollapseObj: CollapseObj = {};
    if (tutureUtilities.isArray(arr)) {
      arr.map(arrItem => {
        constructNewCollapseObj[arrItem.file] = arrItem.collapse;
      });
    }

    return constructNewCollapseObj;
  }

  componentDidMount(): void {
    const { commit, diff } = this.props;
    this.setDiffAndFiles(commit, diff);

    // construct collapsed arr
    const newCollapseObj = this.getCollapseObj(diff);
    this.setState({
      collapseObj: newCollapseObj,
    });
  }

  componentWillReceiveProps(nextProps: ContentItemProps): void {
    if (nextProps.commit !== this.props.commit) {
      this.setDiffAndFiles(nextProps.commit, nextProps.diff);
    }

    if (nextProps.diff !== this.props.diff) {
      const newCollapseObj = this.getCollapseObj(nextProps.diff);
      this.setState({
        collapseObj: newCollapseObj,
      });
    }
  }

  extractFileName({ type, oldPath, newPath }: File): string {
    return type === 'delete' ? oldPath : newPath;
  }

  mapArrItemToObjValue = (property: string, arr: any[]): ResObj => {
    let resObj: ResObj = {};

    if (Array.isArray(arr)) {
      arr.map((item) => {
        resObj[item[property]] = item;
      });
    }

    return resObj;
  }

  getEndRenderContent = (diff: Diff[], files: File[]): any[] => {
    // use fileName key map it belongs obj
    const mapedFiles = this.mapArrItemToObjValue('newPath', files);
    const mapedDiff = this.mapArrItemToObjValue('file', diff);
    const endRenderContent = diff.map(diffItem => {
      const fileName = diffItem.file;
      return {
        ...mapedDiff[fileName],
        ...mapedFiles[fileName],
      };
    });

    return endRenderContent;
  }

  renderIcon = (type: string): React.ReactNode => {
    const mapTypeToSvg: {
      [index: string]: string;
    } = {
      up,
      down,
    };

    return <Image src={mapTypeToSvg[type]} />;
  }

  toggleCollapse = (fileName: string): void => {
    const { collapseObj } = this.state;
    const newCollapseObj = { ...collapseObj, [fileName]: !collapseObj[fileName] };

    this.setState({
      collapseObj: newCollapseObj,
    });
  }

  render() {
    const { files, diff, collapseObj } = this.state;
    const needRenderFiles = this.getEndRenderContent(diff, files);

    return (
      <div className="ContentItem">
        {
          needRenderFiles.map((file: File & Diff, i) => (
            <div key={i}>
              <article className="diff-file" key={i}>
                <header className="diff-file-header">
                    <strong className="filename">{this.extractFileName(file)}</strong>
                    <button
                      onClick={() => this.toggleCollapse(file.file)}
                    >
                    {this.renderIcon(collapseObj[file.file] ? 'up' : 'down')}
                    </button>
                </header>
                <main>
                  {
                    file && !collapseObj[file.file] && (
                      <DiffView key={i} hunks={file.hunks} viewType={this.props.viewType} />
                    )
                  }
                </main>
              </article>
              <div>
                <div style={{ marginTop: '20px' }}>
                  {
                    this.props.renderExplain(file.explain)
                  }
                </div>
              </div>
            </div>
          ))
        }
      </div>
    );
  }
}
