import React, { Component } from 'react';
const G6 = require('@antv/g6');
/**
 * AntV G6是蚂蚁金服出品的图可视化引擎
 * 官网地址https://g6.antv.vision/zh
 */
export default class ShowRelation extends Component {
    constructor(props) {
        super(props);
        /**
         * 节点的唯一标识为ID，即数据中的upID(上游ID)和_selfID(本节点ID)
         */
        this.recordLists = [
            {
                'upID': '111',
                'superior': '董事长',
                'superiorName': 'Bob',
                '_selfID': '222',
                '_self': '高级顾问',
                '_selfName': 'Alice'
            },
            {
                'upID': '111',
                'superior': '董事长',
                'superiorName': 'Bob',
                '_selfID': '333',
                '_self': '董事长助理',
                '_selfName': 'Mary'
            },
            {
                'upID': '111',
                'superior': '董事长',
                'superiorName': 'Bob',
                '_selfID': '444',
                '_self': '总经理',
                '_selfName': 'Henry'
            },
            {
                'upID': '222',
                'superior': '高级顾问',
                'superiorName': 'upTenant222',
                '_selfID': '555',
                '_self': '高级顾问助理',
                '_selfName': 'William'
            },
            {
                'upID': '444',
                'superior': '总经理',
                'superiorName': 'Henry',
                '_selfID': '666',
                '_self': '开发部经理',
                '_selfName': 'Bill'
            },
            {
                'upID': '444',
                'superior': '总经理',
                'superiorName': 'Henry',
                '_selfID': '777',
                '_self': '测试部经理',
                '_selfName': 'Gary'
            },
            //......
        ]
    }

    componentDidMount() {
        const data = {
            nodes: [],
            edges: []
        };
        const lists = this.recordLists;
        lists.forEach((item, index) => {
            data.nodes.push({
                superiorName: item.superiorName,
                superior: item.superior,
                id: `${item.upID}`,
            });
            data.nodes.push({
                superiorName: item._selfName,
                superior: item._self,
                id: `${item._selfID}`,
            });
            data.edges.push({
                source: `${item.upID}`,
                target: `${item._selfID}`,
            });
        });
        const obj = {};
        data.nodes = data.nodes.reduce((cur, next) => {
            if (next.id !== 'undefined' && !obj[next.id]) {
                obj[next.id] = true;
                cur.push(next);
            }
            return cur;
        }, []);
        // 自定义节点
        G6.registerNode('relationNode', {
            drawShape: function drawShape(cfg, group) {
                const strokeColor = '#CDCDCD';
                const calcStrLen = str => {
                    let len = 0;
                    for (let i = 0; i < str.length; i++) {
                        if (str.charCodeAt(i) > 0 && str.charCodeAt(i) < 128) {
                            len++;
                        } else {
                            len += 2;
                        }
                    }
                    return len;
                };
                //解决文字过长溢出问题
                const fittingString = (str, maxWidth, fontSize) => {
                    const fontWidth = fontSize * 1.3; // 字号+边距
                    maxWidth = maxWidth * 2; // 需要根据自己项目调整
                    const width = calcStrLen(str) * fontWidth;
                    const ellipsis = '…';
                    if (width > maxWidth) {
                        const actualLen = Math.floor((maxWidth - 10) / fontWidth);
                        const result = str.substring(0, actualLen) + ellipsis;
                        return result;
                    }
                    return str;
                };
                const rect = group.addShape('rect', {
                    attrs: {
                        x: -100 + 5,
                        y: -25,
                        width: 200,
                        height: 60,
                        radius: 3,
                        stroke: strokeColor,
                        fill: `l (0) 0:${strokeColor} ` + 0.015 + `:${strokeColor} ` + 0.015 + ':#fff',
                        fillOpacity: 1,
                        lineWidth: 1
                    }
                });
                group.addShape('text', {
                    attrs: {
                        x: -95 + 10,
                        y: 3,
                        fill: '#333',
                        text: fittingString(cfg.superiorName, 185, 14),
                        fontSize: 14,
                        fontWeight: 510,
                        isName: true
                    }
                })
                group.addShape('text', {
                    attrs: {
                        x: -95 + 10,
                        y: 25,
                        fill: '#999',
                        text: fittingString(cfg.superior, 185, 12),
                        fontSize: 12,
                        fontWeight: 510,
                        isPosition: true
                    }
                })

                return rect;
            }
        }, 'single-shape');
        const findNodeBySource = function (source) {
            const nodes = graph.getNodes();
            let res = null;
            if (nodes.length) {
                res = nodes.find((item) => {
                    return item._cfg.id === source;
                })
            }
            return res;
        }
        const findNodeByTarget = function (target) {
            const nodes = graph.getNodes();
            let res = null;
            if (nodes.length) {
                res = nodes.find((item) => {
                    return item._cfg.id === target;
                })
            }
            return res;
        }
        const findParents = function (edgeItems, initItem, lastItem) {
            edgeItems.length && edgeItems.forEach((edgeItem) => {
                const parentNode = findNodeBySource(edgeItem.getModel().source);
                const indexNode = findNodeByTarget(edgeItem.getModel().target);
                graph.setItemState(edgeItem, 'highlight', true);
                graph.update(edgeItem, {
                    style: {
                        stroke: '#FD9839',
                        endArrow: {
                            path: 'M 0,0 L 8,4 A 5,5,0,0,1,8,-4 Z',
                            fill: '#FD9839'
                        }
                    }
                })
                if (parentNode) {
                    if (parentNode._cfg.id !== initItem._cfg.id && parentNode._cfg.id !== lastItem._cfg.id) {
                        graph.setItemState(parentNode, 'highlight', true);
                        graph.update(parentNode, {
                            style: {
                                stroke: '#FD9839',
                                fill: 'l (0) 0:#FD9839 ' + 0.015 + ':#FD9839 ' + 0.015 + ':#fff',
                                cursor: 'pointer',
                            }
                        })
                        findParents(parentNode.getInEdges(), initItem, indexNode);
                    }
                }
            });
        }

        const findSons = function (edgeItems, initItem, lastItem) {
            edgeItems.length && edgeItems.forEach((edgeItem) => {
                const indexNode = findNodeByTarget(edgeItem.getModel().source);
                const sonNode = findNodeByTarget(edgeItem.getModel().target);
                graph.setItemState(edgeItem, 'highlight', true);
                graph.update(edgeItem, {
                    style: {
                        stroke: '#FD9839',
                        endArrow: {
                            path: 'M 0,0 L 8,4 A 5,5,0,0,1,8,-4 Z',
                            fill: '#FD9839'
                        }
                    }
                })
                if (sonNode) {
                    if (sonNode._cfg.id !== initItem._cfg.id && sonNode._cfg.id !== lastItem._cfg.id) {
                        graph.setItemState(sonNode, 'highlight', true);
                        graph.update(sonNode, {
                            style: {
                                stroke: '#FD9839',
                                fill: 'l (0) 0:#FD9839 ' + 0.015 + ':#FD9839 ' + 0.015 + ':#fff',
                                cursor: 'pointer',
                            }
                        })
                        findSons(sonNode.getOutEdges(), initItem, indexNode);
                    }
                }
            });
        }

        const changeOthers = function () {
            graph.getNodes() && graph.getNodes().forEach((item) => {
                if (item.getStates().findIndex(node => {
                    return node === 'highlight'
                }) === -1) {
                    item._cfg.group.cfg.children[1].attrs.fillOpacity = 0.5;
                    item._cfg.group.cfg.children[2].attrs.fillOpacity = 0.5;
                    graph.update(item, {
                        style: {
                            stroke: '#CDCDCD',
                            strokeOpacity: 0.5
                        }
                    })
                }
            })
        }
        const clearStates = function () {
            graph.getNodes() && graph.getNodes().forEach((item) => {
                if (item.getStates().findIndex(node => {
                    return node === 'highlight'
                }) !== -1) {
                    graph.setItemState(item, 'highlight', false);
                }
                item._cfg.group.cfg.children[1].attrs.fillOpacity = 1;
                item._cfg.group.cfg.children[2].attrs.fillOpacity = 1;
                graph.update(item, {
                    style: {
                        stroke: '#CDCDCD',
                        fill: 'l (0) 0:#CDCDCD ' + 0.015 + ':#CDCDCD ' + 0.015 + ':#fff',
                        cursor: 'default',
                        strokeOpacity: 1
                    }
                })
            })
            graph.getEdges() && graph.getEdges().forEach((item) => {
                if (item.getStates().findIndex(edge => {
                    return edge === 'highlight'
                }) !== -1) {
                    graph.setItemState(item, 'highlight', false);
                    graph.update(item, {
                        style: {
                            stroke: '#ddd',
                            endArrow: {
                                path: 'M 0,0 L 8,4 A 5,5,0,0,1,8,-4 Z',
                                fill: '#ddd'
                            }
                        }
                    })
                }
            })
        }

        const graph = new G6.Graph({
            //挂载节点
            container: 'mountNode',
            width: this.props.width || window.innerWidth,
            height: this.props.height || window.innerHeight,
            layout: {
                type: 'dagre',
                ranksep: 40,
                nodesep: 80,
                controlPoints: true
            },
            modes: {
                default: [
                    'drag-canvas',//可拖拽
                    'zoom-canvas'//可缩放
                ]
            },
            defaultNode: {
                //使用自定义节点
                type: 'relationNode',
                labelCfg: {
                    style: {
                        fill: '#666',
                        fontSize: 14,
                        fontWeight: 'bold'
                    }
                }
            },
            defaultEdge: {
                type: 'polyline',
                style: {
                    radius: 20,
                    endArrow: {
                        path: 'M 0,0 L 8,4 A 5,5,0,0,1,8,-4 Z',
                        fill: '#ddd'
                    },
                },
            },
        });
        /**
         * 创建提示
         * @param {postion} 鼠标点击的位置
         * @param {name} string 节点名称
         * @param {id} string 节点id
         */
        const createTooltip = (postion, name, id) => {
            const offsetTop = -60;
            const existTooltip = document.getElementById(id);
            const x = postion.x + 'px';
            const y = postion.y + offsetTop + 'px';
            if (existTooltip) {
                existTooltip.style.left = x;
                existTooltip.style.top = y;
            } else {
                // content
                const tooltip = document.createElement('div');
                const span = document.createElement('span');
                span.textContent = name;
                tooltip.style.padding = '10px';
                tooltip.style.background = 'rgba(0,0,0, 0.65)';
                tooltip.style.color = '#fff';
                tooltip.style.borderRadius = '4px';
                tooltip.appendChild(span);
                // box
                const div = document.createElement('div');
                div.style.position = 'absolute';
                div.style.zIndex = '99';
                div.id = id;
                div.style.left = x;
                div.style.top = y;
                div.appendChild(tooltip);
                document.body.appendChild(div);
            }
        };
        /**
         * 删除提示
         * @param {id} string
         */
        const removeTooltip = (id) => {
            const removeNode = document.getElementById(id);
            if (removeNode) {
                document.body.removeChild(removeNode);
            }
        };
        graph.on('node:mouseenter', ev => {
            const item = ev.item;
            const edgeItems = ev.item.getInEdges() || [];
            const sonEdgeItems = ev.item.getOutEdges() || [];
            findParents(edgeItems, item, item);
            findSons(sonEdgeItems, item, item);
            graph.setItemState(item, 'highlight', true);
            graph.update(item, {
                style: {
                    stroke: '#FD9839',
                    fill: 'l (0) 0:#FD9839 ' + 0.015 + ':#FD9839 ' + 0.015 + ':#fff',
                    cursor: 'pointer',
                }
            })
            changeOthers();
        });
        graph.on('node:mousemove', (evt) => {
            const { item, target, x, y } = evt;
            const {
                attrs: { isName, isPosition },
            } = target;
            const model = item.getModel();
            const { superiorName, _selfName, superior, _self, id } = model;
            if (isName || isPosition) {
                const postion = graph.getClientByPoint(x, y);
                createTooltip(postion, isName ? superiorName || _selfName : superior || _self, id);
            } else {
                removeTooltip(id);
            }
        });
        graph.on('node:mouseout', (evt) => {
            const { item, target } = evt;
            const {
                attrs: { isName, isPosition },
            } = target;
            const model = item.getModel();
            const { id } = model;
            if (isName || isPosition) {
                removeTooltip(id);
            }
        });
        graph.on('node:mouseleave', ev => {
            const item = ev.item;
            clearStates();
            graph.setItemState(item, 'highlight', false);
            graph.update(item, {
                style: {
                    stroke: '#CDCDCD',
                    fill: 'l (0) 0:#CDCDCD ' + 0.015 + ':#CDCDCD ' + 0.015 + ':#fff',
                    cursor: 'default',
                    fillOpacity: 1
                }
            })
        })
        graph.data(data);
        graph.render();
        graph.zoomTo(1);
        //   graph.fitView();
    }

    render() {
        return (
            <div>
                <div id='mountNode' />
            </div>
        );
    }
}
