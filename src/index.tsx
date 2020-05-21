import React from 'react';
import classnames from 'classnames';
import { getDataVarList, getWindowInfo } from './utils';
import './index.css';

const { memo, useRef, useState, useEffect, useCallback } = React;

interface IProps {
  children?: any; // 需要引导的dom
  hasPoint?: boolean; // 是否显示 点
  hasNum?: boolean; // 是否显示第几步
  backText?: string; // 后退文字
  nextText?: string; // 前进文字
  username?: string; // 当前用户名
}

interface dotProps {
  left: number | string;
  top: number | string;
  height: number | string;
  width: number | string;
  tip: string;
  desc: string;
  step: string;
  fRight: number | string;
  fBottom: number | string;
}
// 增加是否显示引导提示
const localKey = 'user_guide_key';
const getLocalGuide = (username: string): boolean => {
  const old = localStorage.getItem(localKey);
  if (old) {
    const data = JSON.parse(old) || {};
    return !data[username];
  }
  return true;
};

const setLocalGuide = (username: string) => {
  const old = localStorage.getItem(localKey);
  let data: { [k: string]: boolean } = {};
  if (old) {
    data = JSON.parse(old) || {};
  }
  data[username] = true;
  localStorage.setItem(localKey, JSON.stringify(data));
};
const Guide = memo((props: IProps) => {
  const { children, hasPoint = true, hasNum = false, backText = 'back', nextText = 'next', username } = props;
  const parentRef = useRef<any>(null); // 父元素
  const shadowRef = useRef<any>(null); // 遮罩层
  const [contentStyle, setContentStyle] = useState({}); // 内容的样式
  const [tipStyle, setTipStyle] = useState({}); // tip标题的样式
  const [tip, setTip] = useState<string>(''); // 每一步提示的标题
  const [desc, setDesc] = useState<string>(''); // 每一步提示的描述内容
  const [dots, setDots] = useState<dotProps[]>([]); // 点的dom
  const [activeIndex, setActiveIndex] = useState<number>(0); // 当前索引
  const [arrowClass, setArrowClass] = useState<any>({
    top: '-15px',
    borderTopColor: 'transparent',
    borderRightColor: 'transparent',
    borderBottomColor: '#3370ff',
    borderLeftColor: 'transparent',
  }); // 箭头样式
  const [iconStyle, setIconStyle] = useState({}); // 数字样式

  const [hasGuideTip, setGuide] = useState<boolean>(false); // 是否显示用户引导
  const getMarkDomInfo = () => {
    const nodeList = getDataVarList(parentRef.current.querySelectorAll('[data-step]')) || [];
    nodeList.sort((a: any, b: any) => Number(a.getAttribute('data-step')) - Number(b.getAttribute('data-step')));
    const dotsDom = nodeList.map((node: any) => {
      const height = node.clientHeight || node.offsetHeight;
      const width = node.clientWidth || node.offsetWidth;
      return {
        left: node.offsetLeft,
        top: node.offsetTop,
        height,
        width,
        tip: node.getAttribute('data-tip'),
        desc: node.getAttribute('data-desc'),
        step: node.getAttribute('data-step'),
        fRight: node.offsetLeft + width,
        fBottom: node.offsetTop + height,
      };
    });

    return { dotsDom, nodeList };
  };

  const getTipStyle = (dot: any) => {
    const { winW, winH } = getWindowInfo();
    const gap = 12;

    let tipObj = {
      opacity: 1,
    };

    if (winH - dot.fBottom > 250 && winW - dot.left > 250) {
      setArrowClass({
        top: '-15px',
        borderTopColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: '#3370ff',
        borderLeftColor: 'transparent',
      });

      tipObj = {
        // @ts-ignore
        top: dot.height + gap,
        left: 0,
      };
    } else if (dot.top > 250 && winW - dot.left > 250) {
      setArrowClass({
        bottom: '-15px',
        left: '10px',
        borderTopColor: '#3370ff',
        borderRightColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: 'transparent',
      });
      // @ts-ignore
      tipObj = { bottom: dot.height + gap, left: 0 };
    } else if ((dot.left > 250 && winH - dot.top > 250) || dot.left > winW) {
      setArrowClass({
        right: '-15px',
        top: '10px',
        borderTopColor: 'transparent',
        borderRightColor: 'transparent',
        borderBottomColor: 'transparent',
        borderLeftColor: '#3370ff',
      });
      // @ts-ignore
      tipObj = { top: 0, right: dot.width + gap };
    } else if (winW - dot.fRight > 250 && winH - dot.top > 250) {
      setArrowClass({
        left: '-15px',
        top: '10px',
        borderTopColor: 'transparent',
        borderRightColor: '#3370ff',
        borderBottomColor: 'transparent',
        borderLeftColor: 'transparent',
      });
      // @ts-ignore
      tipObj = { top: 0, left: dot.width + gap };
    } else {
      // @ts-ignore
      tipObj = { display: 'none' };
    }
    return tipObj;
  };

  const getIconStyle = (dot: any) => {
    return {
      top: dot.top - 17,
      left: dot.left - 17,
      width: '20px',
      height: '20px',
    };
  };
  // focusTargetFn
  const focusTargetFn = (newIndex: number) => {
    const { winH, winW } = getWindowInfo();
    const { nodeList, dotsDom } = getMarkDomInfo();
    const { top, bottom, left, right } = nodeList[newIndex].getBoundingClientRect();
    const dTop: number = dotsDom[newIndex].top;
    const dLeft: number = dotsDom[newIndex].left;
    const topBool = top > winH || top < 0 || bottom > winH;
    const leftBool = left > winW || left < 0 || right > winW;
    if (topBool || leftBool) {
      window.scrollTo(dLeft - 100, dTop - 100);
    }
  };
  // setDots
  const setDotsFn = (dot: any, newIndex: number, action?: string) => {
    const delay = action === 'start' ? 100 : 350;
    setContentStyle(dot);
    setIconStyle(getIconStyle(dot));
    setTipStyle({
      display: 'none',
      opacity: 0,
    });
    setTip(dot.tip);
    setDesc(dot.desc);
    focusTargetFn(newIndex);

    const timer = setTimeout(() => {
      setTipStyle(getTipStyle(dot));
      clearTimeout(timer);
    }, delay);
  };
  // removeActiveFn
  const removeActiveFn = () => {
    const { nodeList } = getMarkDomInfo();

    const lastNode = nodeList[activeIndex];
    if (lastNode) {
      lastNode.style.setProperty('position', '');
      lastNode.style.setProperty('z-index', 'auto');
    }
  };

  // setTargetIndexFn
  const setTargetIndexFn = (node: any, newIndex: number) => {
    const timer = setTimeout(() => {
      node.style.setProperty('position', 'relative');
      node.style.setProperty('z-index', '999996', 'important');
      clearTimeout(timer);
    }, 0);

    if (newIndex !== activeIndex) {
      removeActiveFn();
    }
  };
  // 前进 和 后退
  const handleChangeStep = (val: number, e: any) => {
    const { dotsDom, nodeList } = getMarkDomInfo();

    const newIndex = /\d+/g.test(e) ? e : activeIndex + val;
    setActiveIndex(newIndex);
    setDotsFn(dotsDom[newIndex], newIndex);
    setTargetIndexFn(nodeList[newIndex], newIndex);
  };
  // onResizeWindow
  const onResizeWindow = useCallback(() => {
    const { dotsDom } = getMarkDomInfo();
    const dot = dotsDom[activeIndex];
    setContentStyle(dot);
    setDots(dotsDom);
    setTipStyle(getTipStyle(dot));
    setIconStyle(getIconStyle(dot));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 初始化
  useEffect(() => {
    const { dotsDom, nodeList } = getMarkDomInfo();
    setDots(dotsDom);
    setTargetIndexFn(nodeList[0], 0);
    setDotsFn(dotsDom[0], 0);
    window.addEventListener('resize', onResizeWindow, false);
    setGuide(getLocalGuide(username));
    return function cleanup() {
      window.removeEventListener('resize', onResizeWindow, false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasGuideTip]);

  // 切换
  const changeStep = (event: any) => {
    const reg = /^item\d/g;
    if (reg.test(event.target.id)) {
      const jump = event.target.id.slice(-1);
      handleChangeStep(1, Number(jump));
    }
  };

  // const handleOk = (event: any) => {
  //   onOk(event);
  // };
  const closeGuideFn = () => {
    removeActiveFn();
    setActiveIndex(0);
    // todo 跳过回调
    // onCancel(event);
  };

  // 跳过/完成 引导
  const handleSkip = () => {
    // event = event || window.event;
    // const { dotsDom } = getMarkDomInfo();
    // 完成回调
    // if (activeIndex === dotsDom.length - 1) {
    //   handleOk(event)
    // }
    closeGuideFn();

    setLocalGuide(username);
    setGuide(getLocalGuide(username));
  };

  // 是否到最后一步
  const nextDisabled = activeIndex === dots.length - 1;

  // 显示的引导内容
  const guideNodes = [
    <div className="user_guide_shadow" ref={shadowRef} key="user_guide_shadow" />,
    <div className="user_guide_content" key="user_guide_content" style={contentStyle}>
      <div className="user_guide_tooltip" style={tipStyle}>
        <div className="user_tip_title">{tip}</div>
        <div className="user_tip_desc">{desc}</div>
        {hasPoint && (
          <div className="user_guide_bullet">
            <ul onClick={changeStep}>
              {dots &&
                dots.map((item: any, index: number) => {
                  return (
                    <li key={`item${index}`}>
                      <div
                        key={`item${index}`}
                        id={`item${index}`}
                        className={index === activeIndex ? 'user_active_dot' : ''}
                      />
                    </li>
                  );
                })}
            </ul>
          </div>
        )}
        <div className="user_button_group">
          <button type="button" className={classnames("user_btn", "user_btn_total")} onClick={handleSkip}>
            {nextDisabled ? '完成' : '跳过'}
          </button>
          <div>
            <button
              type="button"
              className={classnames(
                "user_btn",
                "user_btn_left",
                !activeIndex ? "user_btn_disabled" : '',
              )}
              disabled={!activeIndex}
              onClick={e => handleChangeStep(-1, e)}
            >
              <span className="user_icon_left" />
              <span>{backText}</span>
            </button>
            <button
              type="button"
              className={classnames(
                "user_btn",
                "user_btn_right",
                nextDisabled ? "user_btn_disabled" : '',
              )}
              disabled={nextDisabled}
              onClick={e => handleChangeStep(1, e)}
            >
              <span>{nextText}</span>
              <span className="user_icon_right" />
            </button>
          </div>
        </div>
        <div className={classnames("user_guide_arrow")} style={arrowClass} />
      </div>
    </div>,
    hasNum && (
      <div className="user_guide_icon_num" key="user_guide_icon_num" style={iconStyle}>
        {activeIndex + 1}
      </div>
    ),
  ];

  return (
    <div className="user_guide_box" ref={parentRef}>
      {children}
      {hasGuideTip && guideNodes}
    </div>
  );
});

export default Guide
