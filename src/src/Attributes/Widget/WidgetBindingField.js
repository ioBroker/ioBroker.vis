import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@mui/styles';

import {
    Button, Checkbox,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle, FormControlLabel,
    IconButton, InputAdornment,
    Switch,
    TextField,
} from '@mui/material';

import {
    Cancel, Check,
    Clear, Link as LinkIcon,
} from '@mui/icons-material';

import { I18n, Utils, SelectID } from '@iobroker/adapter-react-v5';

import VisFormatUtils from '../../Vis/visFormatUtils';
import { store, recalculateFields } from '../../Store';

const styles = () => ({
    dialog: {
        height: 'calc(100% - 64px)',
    },
    content: {
        width: 'calc(100% - 50px)',
        height: 'calc(100% - 50px)',
        overflow: 'hidden',
    },
    edit: {
        display: 'inline-block',
        width: '100%',
        overflow: 'hidden',
        verticalAlign: 'top',
    },
    help: {
        marginLeft: 10,
        display: 'inline-block',
        width: '100%',
        overflow: 'hidden',
        verticalAlign: 'top',
    },
    space: {
        marginLeft: 4,
    },
    code: {
        fontFamily: 'monospace',
    },
    indent: {
        paddingLeft: 40,
    },
    fieldContent: {
        fontSize: '80%',
        '&&&&&&': {
            fontSize: '80%',
        },
    },
    clickable: {
        cursor: 'pointer',
        textDecoration: 'underline',
    },
    valueTitle: {
        fontFamily: 'monospace',
        fontWeight: 'bold',
    },
    valueContent: {
        fontFamily: 'monospace',
    },
});

class WidgetBindingField extends Component {
    constructor(props) {
        super(props);
        let value = this.props.widget[this.props.isStyle ? 'style' : 'data'][this.props.field.name] || '';
        if (value === undefined || value === null) {
            value = '';
        } else {
            value = value.toString();
        }

        this.state = {
            value,
            editValue: value,
            showSelectIdDialog: false,
            showEditBindingDialog: false,
            newStyle: true,
            error: '',
            values: {},
        };

        this.inputRef = React.createRef();
    }

    static getDerivedStateFromProps(props, state) {
        let value = props.widget[props.isStyle ? 'style' : 'data']?.[props.field.name] || '';
        if (value === undefined || value === null) {
            value = '';
        } else {
            value = value.toString();
        }

        if (value !== state.value) {
            return { value };
        }

        return null;
    }

    detectOldBindingStyle(value) {
        this.visFormatUtils = this.visFormatUtils || new VisFormatUtils({ vis: window.vis });
        const oids = this.visFormatUtils.extractBinding(value);
        if (!oids) {
            return false;
        }
        if (oids.find(it => it.token?.includes(':'))) {
            return false;
        }
        return true;
    }

    async calculateValue(value) {
        this.visFormatUtils = this.visFormatUtils || new VisFormatUtils({ vis: window.vis });
        if (value === undefined || value === null) {
            return '';
        }
        value = value.toString();

        const oids = this.visFormatUtils.extractBinding(value);
        if (!oids) {
            return value;
        }
        // read all states
        const stateOids = [];
        oids.forEach(oid => {
            const parts = oid.visOid.split('.');
            if (parts[parts.length - 1] === 'val' || parts[parts.length - 1] === 'ts' || parts[parts.length - 1] === 'lc' || parts[parts.length - 1] === 'ack') {
                parts.pop();
            }
            const id = parts.join('.');
            if (!stateOids.includes(id)) {
                stateOids.push(id);
            }
            if (oid.operations) {
                for (let op = 0; op < oid.operations.length; op++) {
                    const args = oid.operations[op].arg;
                    if (args && args.length) {
                        for (let a = 0; a < args.length; a++) {
                            if (!stateOids.includes(args[a].systemOid)) {
                                stateOids.push(args[a].systemOid);
                            }
                        }
                    }
                }
            }
        });

        const values = {};
        for (let i = 0; i < stateOids.length; i++) {
            if (stateOids[i].includes('.')) {
                const state = await this.props.socket.getState(stateOids[i]);
                state && Object.keys(state).forEach(attr => {
                    const name = `${stateOids[i]}.${attr}`;
                    if (oids.find(it => it.visOid === name || it.operations?.find(op => op?.arg?.find(arg => arg.visOid === name)))) {
                        values[name] = state[attr];
                    }
                });
            }
        }

        return {
            calculatedEditValue: this.visFormatUtils.formatBinding({
                format: value,
                view: this.props.selectedView,
                wid: this.props.selectedWidgets[0],
                widget: store.getState().visProject[this.props.selectedView].widgets[this.props.selectedWidgets[0]],
                widgetData: store.getState().visProject[this.props.selectedView].widgets[this.props.selectedWidgets[0]].data,
                values,
            }),
            values,
        };
    }

    onChange(value) {
        const project = JSON.parse(JSON.stringify(store.getState().visProject));
        const field = this.props.field;

        this.props.selectedWidgets.forEach(wid => {
            const data = this.props.isStyle
                ? project[this.props.selectedView].widgets[wid].style
                : project[this.props.selectedView].widgets[wid].data;

            data[field.name] = value;
        });

        this.props.changeProject(project);

        // try to calculate binding
        this.setState({ value });
    }

    renderSpecialNames() {
        const classes = this.props.classes;
        return <div>
            <h4>Special bindings</h4>
            <p>There are a number of different internal bindings to provide additional information in views:</p>
            <ul>
                <li>
                    <b className={classes.clickable} onClick={() => this.insertInText('username')}>username</b>
                    <span className={classes.space}>- shows logged-in user</span>
                </li>
                <li>
                    <b className={classes.clickable} onClick={() => this.insertInText('view')}>view</b>
                    <span className={classes.space}>- name of actual view</span>
                </li>
                <li>
                    <b className={classes.clickable} onClick={() => this.insertInText('wname')}>wname</b>
                    <span className={classes.space}>- widget name</span>
                </li>
                <li>
                    <b className={classes.clickable} onClick={() => this.insertInText('widget')}>widget</b>
                    <span className={classes.space}>
                        - is an object with all data of widget. Can be used only in JS part, like
                        <span className={`${classes.code} ${classes.space}`}>&#123;a:a;widget.data.name&#125;</span>
                    </span>
                </li>
                <li>
                    <b className={classes.clickable} onClick={() => this.insertInText('wid')}>wid</b>
                    <span className={classes.space}>- name of actual widget</span>
                </li>
                <li>
                    <b className={classes.clickable} onClick={() => this.insertInText('language')}>language</b>
                    <span className={classes.space}>- can be</span>
                    <b className={classes.space}>de</b>
                    ,
                    <b className={classes.space}>en</b>
                    <span className={classes.space}>or</span>
                    <b className={classes.space}>ru</b>
                    .
                </li>
                <li>
                    <b className={classes.clickable} onClick={() => this.insertInText('instance')}>instance</b>
                    <span className={classes.space}>- browser instance</span>
                </li>
                <li>
                    <b className={classes.clickable} onClick={() => this.insertInText('login')}>login</b>
                    <span className={classes.space}>- if login required or not (e.g., to show/hide logout button)</span>
                </li>
                <li>
                    <b className={classes.clickable} onClick={() => this.insertInText('local_')}>local_*</b>
                    <span className={classes.space}>
                        - if state name is started from
                        <b className={classes.space}>local_</b>
                        <span className={classes.space}>it will not be reported to ioBroker but will update all widgets, that depends on this state. (Local variable for current browser session)</span>
                    </span>
                </li>
            </ul>
        </div>;
    }

    renderHelpForNewStyle() {
        const classes = this.props.classes;
        return <div>
            <h4>Bindings of objects</h4>
            <p>Normally, most of the widgets have ObjectID attribute and this attribute can be bound with some value of object ID.</p>
            <p>But there is another option for how to bind *any* attribute of widget to some ObjectID.</p>

            <p>
                Just write into attribute
                <i className={classes.space}>&#123;object.id&#125;</i>
                <span className={classes.space}>and it will be bound to this object&apos;s value.</span>
            </p>
            <p>If you use the special format, you can even make some simple operations with it, e.g., multiplying or formatting.</p>

            <p>E.g., to calculate the hypotenuse of a triangle:</p>

            <p className={classes.code}>&#123;h:javascript.0.myCustom.height;w:javascript.0.myCustom.width;Math.max(20, Math.sqrt(h*h + w*w))&#125;</p>
            <p className={classes.space}>will be interpreted as function:</p>

            <p className={classes.code}>
                value = await (async function () &#123;
                <br />
                <span className={classes.indent}>var h = (await getState(&apos;javascript.0.myCustom.height&apos;)).val;</span>
                <br />
                <span className={classes.indent}>var w = (await getState(&apos;javascript.0.myCustom.width&apos;)).val;</span>
                <br />
                <span className={classes.indent}>return Math.max(20, Math.sqrt(h * h + w * w));</span>
                <br />
                &#125;)();
            </p>

            <p>or</p>

            <p>
                <span className={classes.code}>&#123;h:javascript.0.myCustom.height;w:javascript.0.myCustom.width;h*w&#125;</span>
                <span className={classes.space}>will just multiply height with width.</span>
            </p>

            <p>You can use *any* javascript (browser) functions. Arguments must be defined with &apos;:&apos;, if not, it will be interpreted as formula.</p>

            <p>Take care about types. All of them are defined as strings. To be sure, that value will be treated as number use parseFloat function.</p>

            <p>So our Hypotenuse calculation will be:</p>
            <p className={classes.code}>
                &#123;h:javascript.0.myCustom.height;w:javascript.0.myCustom.width;Math.max(20, Math.sqrt(Math.pow(parseFloat(h), 2) + Math.pow(parseFloat(w), 2)))&#125;
            </p>
        </div>;
    }

    renderHelpForOldStyle() {
        const classes = this.props.classes;
        return <div>
            <h4>Deprecated format</h4>
            <p>Patten has the following format:</p>

            <p>
                <span className={classes.code}>&#123;objectID;operation1;operation2;...&#125;</span>
            </p>

            <p>The following operations are supported:</p>
            <ul>
                <li>
                    <b
                        className={classes.clickable}
                        onClick={() => this.insertInText('*', {
                            oldStyle: true,
                            desc: 'Multiply with N',
                            args: [{ type: 'number', label: 'N' }],
                        })}
                    >
                        *(N)
                    </b>
                    - multiplying. Argument must be in brackets, like
                    <i className={classes.space}>&quot;*(4)&quot;</i>
                    .
                    <span className={classes.space}>this sample, we multiply the value with 4.</span>
                </li>
                <li>
                    <b
                        className={classes.clickable}
                        onClick={() => this.insertInText('+', {
                            oldStyle: true,
                            desc: 'Add to N',
                            args: [{ type: 'number', label: 'N' }],
                        })}
                    >
                        +(N)
                    </b>
                    - add. Argument must be in brackets, like
                    <i className={classes.space}>&quot;+(4.5)&quot;</i>
                    .
                    <span className={classes.space}>In this sample we add to value 4.5.</span>
                </li>
                <li>
                    <b
                        className={classes.clickable}
                        onClick={() => this.insertInText('-', {
                            oldStyle: true,
                            desc: 'Subtract N from value',
                            args: [{ type: 'number', label: 'N' }],
                        })}
                    >
                        -(N)
                    </b>
                    - subtract. Argument must be in brackets, like
                    <i className={classes.space}>&quot;-(-674.5)&quot;</i>
                    .
                    <span className={classes.space}>In this sample we subtract from value -674.5.</span>
                </li>
                <li>
                    <b
                        className={classes.clickable}
                        onClick={() => this.insertInText('/', {
                            oldStyle: true,
                            desc: 'Divide by D',
                            args: [{ type: 'number', label: 'D' }],
                        })}
                    >
                        /(D)
                    </b>
                    - dividing. Argument must be in brackets, like
                    <i className={classes.space}>&quot;/(0.5)&quot;</i>
                    .
                    <span className={classes.space}>In this sample, we divide the value by 0.5.</span>
                </li>
                <li>
                    <b
                        className={classes.clickable}
                        onClick={() => this.insertInText('%', {
                            oldStyle: true,
                            desc: 'Modulo with M',
                            args: [{ type: 'number', label: 'M' }],
                        })}
                    >
                        %(M)
                    </b>
                    - modulo. Argument must be in brackets, like
                    <i className={classes.space}>&quot;%(5)&quot;</i>
                    .
                    <span className={classes.space}>In this sample, we take modulo of 5.</span>
                </li>
                <li>
                    <b
                        className={classes.clickable}
                        onClick={() => this.insertInText('round', {
                            oldStyle: true,
                            desc: 'Round to integer',
                        })}
                    >
                        round
                    </b>
                    - round the value.
                </li>
                <li>
                    <b
                        className={classes.clickable}
                        onClick={() => this.insertInText('round', {
                            oldStyle: true,
                            desc: 'Round with R places after comma',
                            args: [{ type: 'number', label: 'R' }],
                        })}
                    >
                        round(R)
                    </b>
                    - round the value with N places after point, e.g.,
                    <i>&quot;34.678;round(1) =&gt; 34.7&quot;</i>
                </li>
                <li>
                    <b
                        className={classes.clickable}
                        onClick={() => this.insertInText('hex', {
                            oldStyle: true,
                            desc: 'convert value to hexadecimal value',
                        })}
                    >
                        hex
                    </b>
                    <b>hex</b>
                    - convert value to hexadecimal value. All letters are lower cased.
                </li>
                <li>
                    <b
                        className={classes.clickable}
                        onClick={() => this.insertInText('hex2', {
                            oldStyle: true,
                            desc: 'Convert value to hexadecimal value. If value less 16, so the leading zero will be added',
                        })}
                    >
                        hex2
                    </b>
                    <b>hex2</b>
                    - convert value to hexadecimal value. All letters are lower cased. If value less 16, so the leading zero will be added.
                </li>
                <li>
                    <b
                        className={classes.clickable}
                        onClick={() => this.insertInText('HEX', {
                            oldStyle: true,
                            desc: 'Convert value to hexadecimal value. All letters are upper cased',
                        })}
                    >
                        HEX
                    </b>
                    <b>HEX</b>
                    - same as hex, but upper-cased.
                </li>
                <li>
                    <b
                        className={classes.clickable}
                        onClick={() => this.insertInText('HEX2', {
                            oldStyle: true,
                            desc: 'Convert value to hexadecimal value. All letters are upper cased. If value less 16, so the leading zero will be added',
                        })}
                    >
                        HEX
                    </b>
                    <b>HEX2</b>
                    - same as hex2, but upper-cased.
                </li>
                <li>
                    <b
                        className={classes.clickable}
                        onClick={() => this.insertInText('min', {
                            oldStyle: true,
                            desc: 'if value is less than N, take the N, else take the value',
                            args: [{ type: 'number', label: 'N' }],
                        })}
                    >
                        min(N)
                    </b>
                    - if value is less than N, take the N, else value
                </li>
                <li>
                    <b
                        className={classes.clickable}
                        onClick={() => this.insertInText('max', {
                            oldStyle: true,
                            desc: 'if value is greater than M, take the M, else take the value',
                            args: [{ type: 'number', label: 'M' }],
                        })}
                    >
                        max(N)
                    </b>
                    - if value is greater than M, take the M, else value
                </li>
                <li>
                    <b
                        className={classes.clickable}
                        onClick={() => this.insertInText('sqrt', {
                            oldStyle: true,
                            desc: 'square root',
                            args: [{ type: 'number', label: 'M' }],
                        })}
                    >
                        sqrt
                    </b>
                    - square root
                </li>
                <li>
                    <b
                        className={classes.clickable}
                        onClick={() => this.insertInText('pow', {
                            oldStyle: true,
                            desc: 'power of N',
                            args: [{ type: 'number', label: 'n' }],
                        })}
                    >
                        pow(n)
                    </b>
                    - power of N.
                </li>
                <li>
                    <b
                        className={classes.clickable}
                        onClick={() => this.insertInText('pow', {
                            oldStyle: true,
                            desc: 'power of 2',
                        })}
                    >
                        pow
                    </b>
                    - power of 2.
                </li>
                <li>
                    <b
                        className={classes.clickable}
                        onClick={() => this.insertInText('floor', {
                            oldStyle: true,
                            desc: 'Math.floor',
                        })}
                    >
                        floor
                    </b>
                    - Math.floor
                </li>
                <li>
                    <b
                        className={classes.clickable}
                        onClick={() => this.insertInText('ceil', {
                            oldStyle: true,
                            desc: 'Math.ceil',
                        })}
                    >
                        ceil
                    </b>
                    - Math.ceil
                </li>
                <li>
                    <b
                        className={classes.clickable}
                        onClick={() => this.insertInText('ceil', {
                            oldStyle: true,
                            desc: 'Math.ceil',
                        })}
                    >
                        ceil
                    </b>
                    <b className={classes.clickable} onClick={() => this.insertInText('*', true, true)}>random(R)</b>
                    - Math.random() * R, or just Math.random() if no argument
                </li>
                <li>
                    <b
                        className={classes.clickable}
                        onClick={() => this.insertInText('formatValue', {
                            oldStyle: true,
                            desc: 'format value according to system settings and use decimals',
                            args: [{ type: 'number', label: 'decimals' }],
                        })}
                    >
                        formatValue(decimals)
                    </b>
                    - format value according to system settings and use decimals
                </li>
                <li>
                    <b
                        className={classes.clickable}
                        onClick={() => this.insertInText('date', {
                            oldStyle: true,
                            desc: 'format value as date. The format is like "YYYY-MM-DD hh:mm:ss.sss"',
                            args: [{ type: 'string', label: 'format' }],
                        })}
                    >
                        date(format)
                    </b>
                    - format value as date. The format is like:
                    <i className={classes.space}>&quot;YYYY-MM-DD hh:mm:ss.sss&quot;</i>
                    . Format is the same as in
                    <a className={classes.space} href="https://github.com/iobroker/iobroker.javascript/blob/master/README.md#formatdate" target="_blank" rel="noreferrer">
                        iobroker.javascript
                    </a>
                    .
                    <span className={classes.space}>If no format given, so the system date format will be used.</span>
                </li>
                <li>
                    <b
                        className={classes.clickable}
                        onClick={() => this.insertInText('momentDate', {
                            oldStyle: true,
                            desc: 'format value as date using Moment.js',
                            link: 'https://momentjs.com/docs/#/displaying/format/',
                            args: [
                                { type: 'string', label: 'format' },
                                { type: 'boolean', label: 'Use today or yesterday' },
                            ],
                        })}
                    >
                        momentDate(format, useTodayOrYesterday)
                    </b>
                    - format value as date using Moment.js.
                    <a className={classes.space} href="https://momentjs.com/docs/#/displaying/format/" target="_blank" rel="noreferrer">
                        formats must be entered according to the moment.js library
                    </a>
                    .
                    <span className={classes.space}>With &apos;useTodayOrYesterday=true&apos; the &apos;moment.js&apos; format &apos;ddd&apos;/&apos;dddd&apos; are overwritten with today / yesterday</span>
                </li>
                <li>
                    <b
                        className={classes.clickable}
                        onClick={() => this.insertInText('array', {
                            oldStyle: true,
                            desc: 'returns the element in given array according to index (converted from value)',
                            args: [{ type: 'string', label: 'array elements divided by comma' }],
                        })}
                    >
                        array(element1,element2[,element3,element4])
                    </b>
                    - returns the element of index. e.g.:
                    <span className={`${classes.code} ${classes.space}`}>&#123;id.ack;array(ack is false,ack is true)&#125;</span>
                </li>
            </ul>

            <p>You can use this pattern in any text, like</p>
            <p className={classes.code}>
                My calculations with &#123;objectID1;operation1;operation2;...&#125; are &#123;objectID2;operation3;operation4;...&#125;
            </p>
            <p>or color calculations:</p>
            <p className={classes.code}>
                #&#123;objectRed;/(100);*(255);HEX2&#125;&#123;objectGreen;HEX2&#125;&#123;objectBlue;HEX2&#125;
            </p>
            <p>
                To show timestamp of object write
                <b className={classes.space}>.ts</b>
                <span className={classes.space}>or</span>
                <b className={classes.space}>.lc</b>
                <span className={classes.space}>(for last change) at the end of object id, e.g.:</span>
            </p>
            <p className={classes.code}>
                Last change: &#123;objectRed.lc;date(hh:mm)&#125;
            </p>
        </div>;
    }

    getSelectedText() {
        return this.state.editValue.substring(this.inputRef.current.selectionStart, this.inputRef.current.selectionEnd);
    }

    renderEditBindDialog() {
        if (!this.state.showEditBindingDialog) {
            return null;
        }
        const varValuesKeys = this.state.values ? Object.keys(this.state.values) : [];

        return <Dialog
            classes={{ paper: this.props.classes.dialog }}
            open={!0}
            maxWidth="lg"
            fullWidth
            key="editDialog"
        >
            <DialogTitle>{I18n.t('Edit binding')}</DialogTitle>
            <DialogContent className={this.props.classes.content}>
                <div className={this.props.classes.edit}>
                    <TextField
                        variant="standard"
                        label={this.props.label}
                        value={this.state.editValue}
                        inputRef={this.inputRef}
                        autoFocus
                        onKeyUp={e => {
                            if (e.keyCode === 13) {
                                this.setState({ showEditBindingDialog: false }, () => this.onChange(this.state.editValue));
                            }
                        }}
                        InputProps={{
                            endAdornment: this.state.editValue ? <InputAdornment position="end">
                                <IconButton
                                    onClick={() => this.setState({ editValue: '' })}
                                    edge="end"
                                >
                                    <Clear />
                                </IconButton>
                            </InputAdornment> : null,
                        }}
                        style={{ width: 'calc(100% - 72px)' }}
                        onChange={async e => this.setState({ editValue: e.target.value }, () => {
                            this.calculateTimeout && clearTimeout(this.calculateTimeout);
                            this.calculateTimeout = setTimeout(async () => {
                                this.calculateTimeout = null;
                                const { calculatedEditValue, values } = await this.calculateValue(e.target.value);
                                this.setState({ calculatedEditValue, values });
                            }, 200);
                        })}
                        helperText={<span>
                            <span style={{ opacity: 0.6, marginRight: 4 }}>
                                {I18n.t('Calculate value')}
                                :
                            </span>
                            {this.state.calculatedEditValue}
                        </span>}
                    />
                    <Button
                        variant="contained"
                        color="primary"
                        style={{ marginLeft: 8 }}
                        title={I18n.t('Insert object ID')}
                        onClick={() => {
                            this.setState({
                                showSelectIdDialog: true,
                                selectionValue: this.getSelectedText(),
                                selectionStart: this.inputRef.current.selectionStart,
                                selectionEnd: this.inputRef.current.selectionEnd,
                            });
                        }}
                    >
                        ...
                    </Button>
                </div>
                {varValuesKeys.length ? <div className={this.props.classes.values}>
                    {varValuesKeys.map(id => <div key={id}>
                        <span className={this.props.classes.valueTitle}>{id}</span>
                        <span>:</span>
                        <span className={`${this.props.classes.space} ${this.props.classes.valueContent}`}>
                            {`${this.state.values[id] === null || this.state.values[id] === undefined ? 'null' : this.state.values[id].toString()} [${typeof this.state.values[id]}]`}
                        </span>
                    </div>)}
                </div> : null}
                <div
                    className={this.props.classes.help}
                    style={{ height: `calc(100% - ${71 + 22 * varValuesKeys.length}px)` }}
                >
                    <div>
                        {I18n.t('Old style')}
                        <Switch
                            checked={this.state.newStyle}
                            onChange={e => this.setState({ newStyle: e.target.checked })}
                        />
                        {I18n.t('New style')}
                    </div>
                    <div style={{ height: 'calc(100% - 38px)', overflow: 'auto' }}>
                        {this.renderSpecialNames()}
                        {this.state.newStyle ? this.renderHelpForNewStyle() : this.renderHelpForOldStyle()}
                    </div>
                </div>
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    disabled={this.state.editValue === this.state.value}
                    color="primary"
                    startIcon={<Check />}
                    onClick={() => {
                        this.setState({ showEditBindingDialog: false }, () => this.onChange(this.state.editValue));
                        store.dispatch(recalculateFields(true));
                    }}
                >
                    {I18n.t('Apply')}
                </Button>
                <Button
                    variant="contained"
                    color="grey"
                    startIcon={<Cancel />}
                    onClick={() => this.setState({ showEditBindingDialog: false })}
                >
                    {I18n.t('Cancel')}
                </Button>
            </DialogActions>
        </Dialog>;
    }

    static isInBrackets(text, pos) {
        let counter = 0;
        for (let i = 0; i < pos; i++) {
            if (text[i] === '{') {
                counter++;
            } else if (text[i] === '}') {
                counter--;
            }
        }
        return counter > 0;
    }

    renderDialogAskToModify() {
        if (!this.state.askToModify) {
            return null;
        }
        return <Dialog
            open={!0}
            key="modifyDialog"
            onClose={() => this.setState({ askToModify: null })}
        >
            <DialogTitle>{I18n.t('Edit binding')}</DialogTitle>
            <DialogContent>
                <div>
                    {I18n.t('Do you want to modify the value or just use it as it is?')}
                </div>
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    color="grey"
                    onClick={() => {
                        const options = this.state.askToModify;
                        options.modify = true;
                        this.setState({ askToModify: null }, () =>
                            this.insertInText(options.text, options));
                    }}
                >
                    {I18n.t('Modify')}
                </Button>
                <Button
                    variant="contained"
                    color="grey"
                    onClick={() => {
                        const options = this.state.askToModify;
                        options.modify = false;
                        this.setState({ askToModify: null }, () =>
                            this.insertInText(options.text, options));
                    }}
                >
                    {I18n.t('Just use without modification')}
                </Button>
            </DialogActions>
        </Dialog>;
    }

    renderDialogArguments() {
        if (!this.state.askForArguments) {
            return null;
        }
        return <Dialog
            open={!0}
            maxWidth="md"
            fullWidth
            onClose={() => this.setState({ askForArguments: null })}
            key="argsDialog"
        >
            <DialogTitle>{I18n.t('Arguments')}</DialogTitle>
            <DialogContent>
                <div>
                    {this.state.askForArguments.desc}
                </div>
                {this.state.askForArguments.args[0] ? <div>
                    <TextField
                        variant="standard"
                        label={this.state.askForArguments.args[0].label}
                        value={this.state.askForArguments.arg1 === undefined ? '' : this.state.askForArguments.arg1}
                        onKeyDown={e => {
                            if (e.keyCode === 13) {
                                const options = this.state.askForArguments;
                                options.args = null;
                                this.setState({ askForArguments: null }, () =>
                                    this.insertInText(options.text, options));
                            }
                        }}
                        InputProps={{
                            endAdornment: this.state.askForArguments.arg1 ? <InputAdornment position="end">
                                <IconButton
                                    onClick={() => this.setState({
                                        askForArguments: {
                                            ...this.state.askForArguments,
                                            arg1: '',
                                        },
                                    })}
                                    edge="end"
                                >
                                    <Clear />
                                </IconButton>
                            </InputAdornment> : null,
                        }}
                        autoFocus
                        onChange={e => this.setState({ askForArguments: { ...this.state.askForArguments, arg1: e.target.value } })}
                    />
                </div> : null}
                {this.state.askForArguments.args[1] ? <div>
                    <FormControlLabel
                        variant="standard"
                        label={this.state.askForArguments.args[1].label}
                        control={<Checkbox
                            checked={!!this.state.askForArguments.arg2}
                            onChange={e => this.setState({ askForArguments: { ...this.state.askForArguments, arg2: e.target.checked } })}
                        />}
                    />
                </div> : null}
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    color="grey"
                    onClick={() => {
                        const options = this.state.askForArguments;
                        options.args = null;
                        this.setState({ askForArguments: null }, () =>
                            this.insertInText(options.text, options));
                    }}
                >
                    {I18n.t('Apply')}
                </Button>
                <Button
                    variant="contained"
                    color="grey"
                    onClick={() => this.setState({ askForArguments: null })}
                >
                    {I18n.t('Cancel')}
                </Button>
            </DialogActions>
        </Dialog>;
    }

    async insertInText(text, options) {
        options = options || {};
        const selectionStart = options.selectionStart === undefined ? this.inputRef.current.selectionStart : options.selectionStart;
        const selectionEnd = options.selectionEnd === undefined ? this.inputRef.current.selectionEnd : options.selectionEnd;

        const isInBrackets = WidgetBindingField.isInBrackets(this.state.editValue, selectionStart);
        if (!options.oldStyle && options.modify === undefined && !isInBrackets) {
            // ask about do you want to modify value or not
            this.setState({ askToModify: { ...options, text } });
            return;
        }
        if (options.oldStyle && options.args) {
            // show the argument dialog
            this.setState({ askForArguments: { ...options, text } });
            return;
        }

        let editValue = this.state.editValue;
        if (editValue) {
            if (!isInBrackets && !options.oldStyle) {
                if (options.modify) {
                    editValue = `${editValue.substring(0, selectionStart)}{v:${text};v * 1}${editValue.substring(selectionEnd)}`;
                } else {
                    editValue = `${editValue.substring(0, selectionStart)}{${text}}${editValue.substring(selectionEnd)}`;
                }
            } else if (options.oldStyle) {
                if (options.arg1 !== undefined && options.arg2 !== undefined) {
                    editValue = `${editValue.substring(0, selectionStart)};${text}(${options.arg1}, ${options.arg2})${editValue.substring(selectionEnd)}`;
                } else if (options.arg1 !== undefined) {
                    editValue = `${editValue.substring(0, selectionStart)};${text}(${options.arg1})${editValue.substring(selectionEnd)}`;
                } else {
                    editValue = `${editValue.substring(0, selectionStart)};${text}${editValue.substring(selectionEnd)}`;
                }
            } else {
                editValue = editValue.substring(0, selectionStart) + text + editValue.substring(selectionEnd);
            }
        } else if (options.oldStyle) {
            if (options.arg1 !== undefined && options.arg2 !== undefined) {
                editValue = `{YOUR_OBJECT_ID;${text}(${options.arg1}, ${options.arg2})`;
            } else if (options.arg1 !== undefined) {
                editValue = `{YOUR_OBJECT_ID;${text}(${options.arg1})`;
            } else {
                editValue = `{YOUR_OBJECT_ID;${text}`;
            }
        } else if (options.modify) {
            editValue = `{v:${text};v * 1}`;
        } else {
            editValue = `{${text}}`;
        }
        const { calculatedEditValue, values } = await this.calculateValue(editValue);

        this.setState({ editValue, calculatedEditValue, values }, () => {
            // set cursor on the same position
            this.inputRef.current.focus();
            if (this.inputRef.current.setSelectionRange) {
                this.inputRef.current.setSelectionRange(selectionStart, selectionStart);
            } else if (this.inputRef.current.createTextRange) {
                const t = this.inputRef.current.createTextRange();
                t.collapse(true);
                t.moveEnd('character', selectionStart);
                t.moveStart('character', selectionStart);
                t.select();
            }
        });
    }

    renderSelectIdDialog() {
        if (!this.state.showSelectIdDialog) {
            return null;
        }
        return <SelectID
            key="selectDialog"
            imagePrefix="../.."
            selected={this.state.selectionValue}
            onOk={async selected => {
                // insert on cursor and replace selected text
                await this.insertInText(selected, { selectionStart: this.state.selectionStart, selectionEnd: this.state.selectionEnd });
            }}
            onClose={() => this.setState({ showSelectIdDialog: false })}
            socket={this.props.socket}
        />;
    }

    render() {
        return [
            <TextField
                key="text"
                variant="standard"
                className={this.props.classes.fieldContent}
                fullWidth
                placeholder={this.props.isDifferent ? I18n.t('different') : null}
                InputProps={{
                    classes: { input: Utils.clsx(this.props.classes.clearPadding, this.props.classes.fieldContent) },
                    endAdornment: <Button
                        title={I18n.t('Edit binding')}
                        disabled={this.props.disabled}
                        size="small"
                        variant="contained"
                        onClick={async () => {
                            const { calculatedEditValue, values } = await this.calculateValue(this.state.value);
                            this.setState({
                                showEditBindingDialog: true,
                                editValue: this.state.value,
                                calculatedEditValue,
                                values,
                                newStyle: !this.detectOldBindingStyle(this.state.value),
                            });
                        }}
                    >
                        <LinkIcon />
                    </Button>,
                }}
                error={!!this.state.error}
                helperText={typeof this.state.error === 'string' ? I18n.t(this.state.error) : null}
                disabled={this.props.disabled}
                value={this.state.value}
                onChange={e => this.onChange(e.target.value)}
            />,
            this.renderEditBindDialog(),
            this.renderSelectIdDialog(),
            this.renderDialogAskToModify(),
            this.renderDialogArguments(),
        ];
    }
}

WidgetBindingField.propTypes = {
    label: PropTypes.string,
    field: PropTypes.object,
    selectedView: PropTypes.string,
    isStyle: PropTypes.bool,
    selectedWidgets: PropTypes.array,
    changeProject: PropTypes.func,
    disabled: PropTypes.bool,
    socket: PropTypes.object,
    // adapterName: PropTypes.string,
    // instance: PropTypes.number,
    // projectName: PropTypes.string,
    isDifferent: PropTypes.bool,
};

export default withStyles(styles)(WidgetBindingField);
