import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector, useStore } from 'react-redux';

/** @jsx jsx */
import { css, jsx } from '@emotion/core';
import { Popconfirm, Input, message } from 'antd';
import { Dispatch, RootState, Store } from 'store';

import {
  assistInfoStyle,
  containerStyle,
  listItemActionStyle,
  listItemStyle,
  headerStyle,
} from './styles';
import OutdatedTag from './widgets/OutdatedTag';
import AddButton from './widgets/AddButton';
import DeleteButton from './widgets/DeleteButton';
import { TocStepItem } from 'types';

const { Search } = Input;

function ReleasedStepListItem(props: {
  item: TocStepItem;
  onClickAdd: React.MouseEventHandler;
}) {
  const { item, onClickAdd } = props;
  const dispatch: Dispatch = useDispatch();

  return (
    <li
      key={item.id}
      css={css`
        ${listItemStyle}
        height: 52px;
      `}
    >
      {item.outdated && <OutdatedTag />}
      <span
        css={css`
          width: ${item.outdated ? '94px' : '134px'};
          display: inline-block;
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        `}
      >
        {item.name}
      </span>
      {item.outdated && (
        <Popconfirm
          title={`确定删除此过时步骤 ${item.name} 吗？`}
          onConfirm={() => {
            dispatch.toc.deleteOutdatedStepList(item.id);
          }}
          okText="确认"
          cancelText="取消"
        >
          <DeleteButton />
        </Popconfirm>
      )}

      <AddButton onClick={onClickAdd} />
    </li>
  );
}

function ReleasedStepList() {
  const store = useStore() as Store;
  const dispatch: Dispatch = useDispatch();

  const [searchValue, setSearchValue] = useState('');
  const defaultUnassignedStepList: TocStepItem[] = useSelector(
    store.select.collection.getUnassignedStepList,
  );

  const {
    articleStepList = [],
    unassignedStepList,
    activeArticle,
  } = useSelector((state: RootState) => state.toc);

  const filteredUnassignedStepList =
    unassignedStepList?.filter((step) => step.name.indexOf(searchValue) >= 0) ||
    [];

  useEffect(() => {
    if (defaultUnassignedStepList && !unassignedStepList) {
      dispatch.toc.setUnassignedStepList(defaultUnassignedStepList);
    }
  }, [defaultUnassignedStepList, dispatch, unassignedStepList]);

  function handleAddStep(stepItem: TocStepItem) {
    if (!unassignedStepList) return;

    if (!activeArticle) {
      return message.warning('请选中文章，再添加步骤');
    }

    const targetArticleStepIndex = articleStepList.findIndex(
      (articleStep) =>
        articleStep?.articleId === activeArticle &&
        articleStep?.number > stepItem.number,
    );

    // The index to insert this item.
    let insertIndex;

    if (targetArticleStepIndex < 0) {
      const articleIndex = articleStepList.findIndex(
        (articleStep) => articleStep.id === activeArticle,
      );
      const articleStepsLen = articleStepList.filter(
        (articleStep) => articleStep?.articleId === activeArticle,
      ).length;

      if (articleStepsLen > 0) {
        insertIndex = articleIndex + articleStepsLen + 1;
      } else {
        insertIndex = articleIndex + 1;
      }
    } else {
      insertIndex = targetArticleStepIndex;
    }

    articleStepList.splice(insertIndex, 0, {
      ...stepItem,
      articleId: activeArticle,
    });
    dispatch.toc.setArticleStepList(articleStepList);

    const newUnassignedStepList = unassignedStepList.filter(
      (step) => step.id !== stepItem.id,
    );
    dispatch.toc.setUnassignedStepList(newUnassignedStepList);

    message.success('添加步骤成功');
  }

  return (
    <div
      className="menu-wrapper step-list"
      css={css`
        ${containerStyle}
        padding-left: 24px;
        padding-right: 24px;
      `}
    >
      <div className="menu-header" css={headerStyle}>
        <h5
          css={css`
            font-size: 16px;
          `}
        >
          待分配步骤
        </h5>
        <p css={assistInfoStyle}>把步骤分配给目录中对应的文章</p>
      </div>
      <div className="menu-body">
        <div
          className="step-list-filter"
          css={css`
            width: 100%;
            margin-top: 16px;
            margin-bottom: 16px;
          `}
        >
          <Search
            placeholder="搜索步骤的标题"
            onSearch={(value) => setSearchValue(value)}
            style={{ height: '40px' }}
          />
        </div>
        <ul
          className="step-list"
          css={css`
            list-style: none;
            padding: 0;
            margin: 0;
          `}
        >
          {filteredUnassignedStepList.map((item) => (
            <ReleasedStepListItem
              item={item}
              onClickAdd={() => {
                console.log('onClickAdd called', item);
                handleAddStep(item);
              }}
            />
          ))}
        </ul>
      </div>
    </div>
  );
}

export default ReleasedStepList;
