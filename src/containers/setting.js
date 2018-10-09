import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  TabContent,
  TabPane,
  Col,
  Row,
  Nav,
  NavItem,
  NavLink,
  Button,
} from 'reactstrap';
import { injectIntl, FormattedMessage } from 'react-intl';
import classnames from 'classnames';
import { fetchSiteSettings } from '../actions';
import SettingForm from '../components/forms/settingForm';

class Setting extends Component {
  constructor(props) {
    super(props);
    this.state = {
      activeTab: '1',
    };
  }

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch(fetchSiteSettings());
  }

  toggle = (tab) => {
    if (this.state.activeTab !== tab) {
      this.setState({
        activeTab: tab
      });
    }
  }

  render() {
    const { formatMessage } = this.props.intl;
    const { settings } = this.props;
    return (
      <div className="content-body">
        <h3>
          <FormattedMessage id="sys.settings" />
        </h3>
        <div>
          <Nav tabs>
            <NavItem>
              <NavLink
                className={classnames({ active: this.state.activeTab === '1' })}
                onClick={() => { this.toggle('1'); }}
              >
                <SettingForm />
              </NavLink>
            </NavItem>
            <NavItem>
              <NavLink
                className={classnames({ active: this.state.activeTab === '2' })}
                onClick={() => { this.toggle('2'); }}
              >
                Moar Tabs
              </NavLink>
            </NavItem>
          </Nav>
          <TabContent activeTab={this.state.activeTab}>
            <TabPane tabId="1">
              <Row>
                <Col sm="12">
                  <h4>Tab 1 Contents</h4>
                </Col>
              </Row>
            </TabPane>
          </TabContent>
        </div>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  settings: state.settingReducer.settings,
});

export default connect(
  mapStateToProps,
  null
)(injectIntl(Setting));