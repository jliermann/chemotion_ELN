import React from 'react';
import {Button, ButtonGroup, ButtonToolbar, FormControls, Input, Modal,
        Accordion, Panel, ListGroup, ListGroupItem, Glyphicon, Tabs, Tab,
        Row, Col} from 'react-bootstrap';
import SVG from 'react-inlinesvg';

import ElementActions from './actions/ElementActions';
import ElementStore from './stores/ElementStore';

import UIStore from './stores/UIStore';
import UIActions from './actions/UIActions';


import NumeralInputWithUnitsCompo from './NumeralInputWithUnitsCompo';
import ElementCollectionLabels from './ElementCollectionLabels';
import ElementAnalysesLabels from './ElementAnalysesLabels';
import SampleDetailsAnalyses from './SampleDetailsAnalyses';
import extra from "./extra/SampleDetailsExtra"
import Select from 'react-select';

import StructureEditorModal from './structure_editor/StructureEditorModal';

import Aviator from 'aviator';

import {solventOptions} from './staticDropdownOptions/options';
import Sample from './models/Sample';
import PolymerSection from './PolymerSection';
import ElementalCompositionGroup from './ElementalCompositionGroup';
import ToggleSection from './common/ToggleSection'
import SampleName from './common/SampleName'

const MWPrecision = 6;


export default class SampleDetails extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      sample: props.sample,
      reaction: null,
      materialGroup: null,
      showStructureEditor: false,
      loadingMolecule: false,
      showElementalComposition: false
    }
  }

  componentDidMount() {
    ElementStore.listen(this.onChange.bind(this));
  }

  componentWillUnmount() {
    ElementStore.unlisten(this.onChange.bind(this));
  }

  onChange(state) {
    if(!state.currentElement || state.currentElement.type == 'sample') {
      this.setState({
        sample: state.currentElement,
        reaction: state.currentReaction,
        materialGroup: state.currentMaterialGroup,
        loadingMolecule: false
      });
    }
  }

  handleSampleChanged(sample) {
    this.setState({
      sample
    });
  }

  handleNameChanged(e) {
    let sample = this.state.sample;
    sample.name = this.refs.nameInput.getValue();
    this.setState({
      sample: sample
    });
  }

  handleExternalLabelChanged(e) {
    let sample = this.state.sample;
    sample.external_label = this.refs.externalLabelInput.getValue();
    this.setState({
      sample: sample
    });
  }

  handleDescriptionChanged(e) {
    let sample = this.state.sample;
    sample.description = this.refs.descriptionInput.getValue();
    this.setState({
      sample: sample
    });
  }

  handleAmountChanged(amount) {
    let sample = this.state.sample;
    sample.setAmountAndNormalizeToGram(amount);
    this.setState({
      sample: sample
    });
  }

  handlePurityChanged(e) {
    let sample = this.state.sample;
    sample.purity = this.refs.purityInput.getValue();
    this.setState({
      sample: sample
    });
  }

  handleDensityChanged(e) {
    let sample = this.state.sample;
    sample.molecule_density = this.refs.densityInput.getValue();
    this.setState({
      sample: sample
    });
  }

  handleImpuritiesChanged(e) {
    let sample = this.state.sample;
    sample.impurities = this.refs.impuritiesInput.getValue();
    this.setState({
      sample: sample
    });
  }

  handleImportedReadoutChanged(e) {
    let sample = this.state.sample;
    sample.imported_readout = this.refs.importedReadoutInput.getValue();
    this.setState({
      sample: sample
    });
  }

  handleBoilingPointChanged(e) {
    let sample = this.state.sample;
    sample.molecule_boiling_point = this.refs.boilingPointInput.getValue();
    this.setState({
      sample: sample
    });
  }

  handleLocationChanged(e) {
    let sample = this.state.sample;
    sample.location = this.refs.locationInput.getValue();
    this.setState({
      sample: sample
    });
  }

  handleSolventChanged(event) {
    let {sample} = this.state;
    sample.solvent = event;
    this.setState({
      sample
    });
  }

  handleMeltingPointChanged(e) {
    let sample = this.state.sample;
    sample.molecule_melting_point = this.refs.meltingPointInput.getValue();
    this.setState({
      sample: sample
    });
  }

  handleTopSecretChanged(e) {
    let sample = this.state.sample;
    let checkedState = this.refs.topSecretInput.props.checked;

    sample.is_top_secret = !checkedState;
    this.setState({
      sample: sample
    });
  }

  handleUnitChanged(unit, nextUnit, value) {
    console.log("ajax call with unit: " + unit + " nextUnit: " + nextUnit + " and value: " + value);
    let convertedValue = value;
    if(unit && nextUnit && unit != nextUnit) {
      switch(unit) {
        case 'g':
          if(nextUnit == 'mol') {
            convertedValue = value * 2;
          }
          break;
        case 'mol':
          if(nextUnit == 'g') {
            convertedValue = value / 2;
          }
          break;
      }
    }
    console.log("result:" + convertedValue);
    return convertedValue;
  }

  showStructureEditor() {
    this.setState({
      showStructureEditor: true
    })
  }

  hideStructureEditor() {
    this.setState({
      showStructureEditor: false
    })
  }

  updateMolecule(molfile, svg_file = null) {
    ElementActions.fetchMoleculeByMolfile(molfile, svg_file);
  }

  handleStructureEditorSave(molfile, svg_file = null) {
    let {sample} = this.state;

    if(sample) {
      sample.molfile = molfile

      sample.contains_residues = molfile.indexOf(' R# ') > -1;

      if(sample.contains_residues)
        sample.sample_svg_file = svg_file;

      sample.formulaChanged = true;
    }
    this.setState({sample: sample, loadingMolecule: true});

    if(sample.contains_residues > -1){
      this.updateMolecule(molfile, svg_file);
    } else {
      this.updateMolecule(molfile);
    }

    this.hideStructureEditor()
  }

  handleStructureEditorCancel() {
    this.hideStructureEditor()
  }

  _submitFunction() {
    let {sample, reaction, materialGroup} = this.state;

    if(reaction) {
      ElementActions.createSampleForReaction(sample);
    } else {
      if(sample.isNew) {
        ElementActions.createSample(sample);
      } else {
        ElementActions.updateSample(new Sample(sample));
      }
    }
  }

  closeDetails() {
    let { currentReaction } = ElementStore.getState();

    if(currentReaction) {
      ElementActions.openReactionDetails(currentReaction);
    } else {
      UIActions.deselectAllElements();

      let uiState = UIStore.getState();
      Aviator.navigate(`/collection/${uiState.currentCollectionId}`);
    }
  }

  _submitLabel() {
    let {sample} = this.state;

    if(sample.isNew) {
      return "Create";
    } else {
      return "Save";
    }
  }

  sampleIsValid() {
    const {sample, loadingMolecule} = this.state;
    return (sample.isValid && !loadingMolecule) || sample.is_scoped == true;
  }

  structureEditorButton(isDisabled) {
    return (
      <Button onClick={this.showStructureEditor.bind(this)} disabled={isDisabled}>
        <Glyphicon glyph='pencil'/>
      </Button>
    )
  }

  // Input components of sample details should be disabled if detail level does not allow to read their content
  topSecretCheckbox(sample) {
    if(!sample.isMethodDisabled('is_top_secret')) {
      return (
        <Input ref="topSecretInput" type="checkbox" label="Top secret" checked={sample.is_top_secret} onChange={(e) => this.handleTopSecretChanged(e)}/>
      )
    }
  }

  moleculeInput(sample) {
    return (
      <Input type="text" label="Molecule" ref="moleculeInput"
             key={sample.id}
             buttonAfter={this.structureEditorButton(sample.isMethodDisabled('molecule_iupac_name'))}
             defaultValue={sample.molecule && (sample.molecule.iupac_name || sample.molecule.sum_formular)}
             value={sample.molecule && (sample.molecule.iupac_name || sample.molecule.sum_formular)}
             disabled={sample.isMethodDisabled('molecule_iupac_name')}
             readOnly={sample.isMethodDisabled('molecule_iupac_name')}
      />
    )
  }

  svgOrLoading(sample) {
    let svgPath = "";
    if (this.state.loadingMolecule) {
      svgPath = "/images/loading-bubbles.svg";
    } else {
      svgPath = sample.svgPath;
    }
    let className = svgPath ? 'svg-container' : 'svg-container-empty'
    return (
      <div className={className}
           onClick={this.showStructureEditor.bind(this)}>
        <Glyphicon className="pull-right" glyph='pencil'/>
        <SVG key={svgPath} src={svgPath} className="molecule-mid"/>
      </div>
    );
  }

  sampleAverageMW(sample) {
    let mw = sample.molecule_molecular_weight;
    if(mw)
      return `(${mw.toFixed(MWPrecision)} g/mol)`;
    else
      return '';
  }

  sampleExactMW(sample) {
    let mw = sample.molecule_exact_molecular_weight
    if(mw)
      return `(Exact mass: ${mw.toFixed(MWPrecision)} g/mol)`;
    else
      return '';
  }

  sampleHeader(sample) {
    const style = {height: '200px'};
    return (
      <Row style={style}>
        <Col md={4}>
          <h3>{sample.title()}</h3>
          <h4><SampleName sample={sample}/></h4>
          <h5>{this.sampleAverageMW(sample)}</h5>
          <h5>{this.sampleExactMW(sample)}</h5>
          <ElementCollectionLabels element={sample} key={sample.id}/>
          <ElementAnalysesLabels element={sample} key={sample.id+"_analyses"}/>
          {this.extraLabels().map(Lab=><Lab element={sample}/>)}
        </Col>
        <Col md={8}>
          {this.svgOrLoading(sample)}
        </Col>
      </Row>
    )
  }

  moleculeInchi(sample) {
    return (
      <Input type="text" label="InChI"
             key={sample.id}
             defaultValue={sample.molecule_inchistring}
             value={sample.molecule_inchistring}
             disabled
             readOnly
      />
    )
  }

  molecularWeight(sample, label = "M. Weight") {
    if(sample.contains_residues)
      label = "M. Weight (defined part)"

    let mw = sample.molecule_molecular_weight;

    return (
      <Input type="text" label={label}
             key={sample.id}
             defaultValue={mw && mw.toFixed(MWPrecision)}
             value={mw && mw.toFixed(MWPrecision)}
             ref="molecularWeight"
             disabled
             readOnly
        />
    )
  }

  moleculeDensity(sample) {
    return (
      <Input type="text" label="Density" ref="densityInput"
             value={sample.molecule_density}
             onChange={(e) => this.handleDensityChanged(e)}
             disabled={sample.isMethodDisabled('molecule_density')}
        />
    )
  }

  moleculeFormular(sample) {
    return (
      <Input type="text" label="Formula"
             key={sample.id}
             defaultValue={sample.molecule_formula}
             value={sample.molecule_formula}
             disabled
             readOnly
        />
    )
  }

  moleculeBoilingPoint(sample) {
    return (
      <Input type="text" label="Boiling Point" ref="boilingPointInput"
             value={sample.molecule_boiling_point}
             onChange={(e) => this.handleBoilingPointChanged(e)}
             disabled={sample.isMethodDisabled('molecule_boiling_point')}
        />
    )
  }

  moleculeMeltingPoint(sample) {
    return (
      <Input type="text" label="Melting Point" ref="meltingPointInput"
             value={sample.molecule_melting_point}
             onChange={(e) => this.handleMeltingPointChanged(e)}
             disabled={sample.isMethodDisabled('molecule_melting_point')}
        />
    )
  }

  sampleName(sample) {
    return (
      <Input type="text" label="Name" ref="nameInput"
             placeholder={sample.name}
             value={sample.name}
             onChange={(e) => this.handleNameChanged(e)}
             disabled={sample.isMethodDisabled('name')}
      />
    )
  }

  sampleImpurities(sample) {
    return (
      <Input type="text" label="Impurities"
             ref="impuritiesInput"
             value={sample.impurities}
             onChange={(e) => this.handleImpuritiesChanged(e)}
             disabled={sample.isMethodDisabled('impurities')}
        />
    )
  }

  sampleSolvent(sample) {
    return (
      <Select ref='solventInput'
              name='solvents'
              multi={false}
              options={solventOptions}
              onChange={(e) => this.handleSolventChanged(e)}
              value={sample.solvent}
              disabled={sample.isMethodDisabled('solvent')}
      />
    )
  }

  attachedAmountInput(sample) {
    if(!sample.contains_residues)
      return false;

    return (
      <td>
        <NumeralInputWithUnitsCompo
          key={sample.id}
          value={sample.defined_part_amount}
          unit='g'
          label="Attached"
          ref="attachedAmountMg"
          id={'attachedAmountMg' + sample.id.toString()}
          metricPrefix='milli'
          metricPrefixes = {['milli','none']}
          title="Weight of the defined part"
          precision={4}
          disabled
          readOnly
          />
      </td>
    )
  }

  sampleNumericInput(sample, unit, prefixes, precision, label, ref = '') {
    if(sample.contains_residues && unit == 'l')
      return false;

    return (
      <td>
        <NumeralInputWithUnitsCompo
          key={sample.id}
          value={sample["amount_" + unit]}
          unit={unit}
          label={label}
          ref={ref}
          metricPrefix={prefixes[0]}
          metricPrefixes = {prefixes}
          precision={precision}
          onChange={(amount) => this.handleAmountChanged(amount)}
          />
      </td>
    )
  }

  sampleAmount(sample) {
    if(sample.isMethodDisabled('amount_value') == false) {
      if(sample.isMethodRestricted('molecule') == true) {
        return (
          <table>
            <tbody>
              <tr>
                {this.sampleNumericInput(sample, 'mg')}
              </tr>
            </tbody>
          </table>
        )
      } else {
        return (
          <table>
            <tbody>
              <tr>
                {this.sampleNumericInput(sample, 'g', ['milli','none'], 4, 'Amount', 'massMgInput')}

                {this.sampleNumericInput(sample, 'l', ['milli','micro','none'], 5, '\u202F', 'l' )}

                {this.sampleNumericInput(sample, 'mol', ['milli','none'], 4, '\u202F', 'amountInput' )}

                {this.attachedAmountInput(sample)}
              </tr>
            </tbody>
          </table>
        )
      }
    } else {
      return (
        <Input type="text" label="Amount" disabled defaultValue="***" value="***" readOnly/>
      )
    }
  }

  samplePurity(sample) {
    return (
      <Input type="text" label="Purity"
             ref="purityInput"
             value={sample.purity}
             numeralFormat='0,0.00'
             onChange={(e) => this.handlePurityChanged(e)}
             disabled={sample.isMethodDisabled('purity')}
      />
    )
  }

  sampleLocation(sample) {
    return (
      <Input type="textarea" label="Location"
             ref="locationInput"
             value={sample.location}
             onChange={(e) => this.handleLocationChanged(e)}
             rows={2}
             disabled={sample.isMethodDisabled('location')}
      />
    )
  }

  sampleDescription(sample) {
    return (
      <Input type="textarea" label="Description" ref="descriptionInput"
             placeholder={sample.description}
             value={sample.description}
             onChange={(e) => this.handleDescriptionChanged(e)}
             rows={2}
             disabled={sample.isMethodDisabled('description')}
        />
    )
  }

  sampleExternalLabel(sample) {
    return (
      <Input type="text" label="External Label"
             ref="externalLabelInput"
             value={sample.external_label}
             onChange={(e) => this.handleExternalLabelChanged(e)}
             disabled={sample.isMethodDisabled('external_label')}
      />
    )
  }

  sampleImportedReadout(sample) {
    return (
      <Input type="text" label="Imported Readout"
             ref="importedReadoutInput"
             value={sample.imported_readout}
             onChange={(e) => this.handleImportedReadoutChanged(e)}
             disabled
      />
    )
  }

  handleSectionToggle() {
    this.setState({showElementalComposition: !this.state.showElementalComposition});
  }

  elementalPropertiesItemHeader(sample) {
    return (
      <ListGroupItem onClick={() => this.handleSectionToggle()}>
        <div className="padding-right col-md-6">
          <label>Elemental composition</label>
        </div>
        <div className="col-md-6">
          <ToggleSection show={this.state.showElementalComposition}/>
          <label>{sample.contains_residues ? 'Polymer section' : '' }</label>
        </div>
      </ListGroupItem>
    )
  }

  elementalPropertiesItemContent(sample, materialGroup, show) {
    if(!show)
      return false;

    return (
      <ListGroupItem className="ea-section">
        <table>
          <tbody>
            <tr>
              <td width="50%" className="padding-right">
                <ElementalCompositionGroup sample={sample}/>
              </td>
              <td width="50%">
                <PolymerSection sample={sample}
                                parent={this}
                                show={sample.contains_residues}
                                materialGroup={materialGroup}/>
              </td>
            </tr>
          </tbody>
        </table>
      </ListGroupItem>
    )
  }

  elementalPropertiesItem(sample) {
    if(!sample.molecule.sum_formular) { // avoid empty ListGroupItem
      return false;
    } else {
      let show = this.state.showElementalComposition;
      let materialGroup = this.state.materialGroup;

      return(
        <div width="100%" className="polymer-section">
          {this.elementalPropertiesItemHeader(sample)}

          {this.elementalPropertiesItemContent(sample, materialGroup, show)}
        </div>
      )
    }
  }

  samplePropertiesTab(ind){
    let sample = this.state.sample || {};
    return(
      <Tab eventKey={ind} title={'Properties'} key={'Props' + sample.id.toString()}>
        <ListGroupItem>
          {this.topSecretCheckbox(sample)}

          {this.moleculeInput(sample)}

          <table width="100%">
            <tbody>
              <tr>
                <td width="50%" className="padding-right">
                  {this.moleculeInchi(sample)}
                </td>
                <td width="25%" className="padding-right">
                  {this.molecularWeight(sample)}
                </td>
                <td width="25%">
                  {this.moleculeDensity(sample)}
                </td>
              </tr>
              <tr>
                <td width="50%" className="padding-right">
                  {this.moleculeFormular(sample)}
                </td>
                <td width="25%" className="padding-right">
                  {this.moleculeBoilingPoint(sample)}
                </td>
                <td width="25%">
                  {this.moleculeMeltingPoint(sample)}
                </td>
              </tr>
            </tbody>
          </table>
        </ListGroupItem>
          {this.elementalPropertiesItem(sample)}
        <ListGroupItem>
          <table width="100%">
            <tbody>
              <tr>
                <td width="25%" className="padding-right">
                  {this.sampleName(sample)}
                </td>
                <td width="25%" className="padding-right">
                  {this.sampleExternalLabel(sample)}
                </td>
                <td width="25%" className="padding-right">
                  {this.sampleImpurities(sample)}
                </td>
                <td width="25%">
                  <label>Solvent</label>
                  {this.sampleSolvent(sample)}
                </td>
              </tr>
              <tr>
                <td width="25%" className="padding-right" colSpan={2}>
                  {this.sampleAmount(sample)}
                </td>
                <td width="25%" className="padding-right">
                  {this.samplePurity(sample)}
                </td>
                <td width="25%">
                  {this.sampleImportedReadout(sample)}
                </td>
              </tr>
              <tr>
                <td width="50%" colSpan={2} className="padding-right">
                  {this.sampleLocation(sample)}
                </td>
                <td width="50%" colSpan={2}>
                  {this.sampleDescription(sample)}
                </td>
              </tr>
            </tbody>
          </table>
        </ListGroupItem>
      </Tab>
    )
  }

  sampleAnalysesTab(ind){
    let sample = this.state.sample || {}
    return(
      <Tab eventKey={ind} title={'Analyses'} key={'Analyses' + sample.id.toString()}>
        <ListGroupItem style={{paddingBottom: 20}}>
          <SampleDetailsAnalyses
            sample={sample}
            onSampleChanged={sample => this.handleSampleChanged(sample)}
            />
        </ListGroupItem>
      </Tab>
    )
  }

  extraTab(ind){
    let sample = this.state.sample || {}
    let num = ind - 2 ;
    let NoName =  extra["Tab"+num];
    let TabName = extra["TabName"+num];
    return(
       <Tab eventKey={ind}  title={TabName} >
         <ListGroupItem style={{paddingBottom: 20}}>
           <NoName  sample={sample}/>
         </ListGroupItem>
       </Tab>
      )
  }
  extraLabels(){
    let labels = [];
    for (let j=0;j < extra.LabelsCount;j++){
      labels.push(extra["Labels"+j])
    }
    return labels;
  }

  render() {
    let sample = this.state.sample || {}
    let molfile = sample.molfile;
    let sampleIsValid = this.sampleIsValid();
    let tabContents = [
                       (i)=>(this.samplePropertiesTab(i)),
                       (i)=>(this.sampleAnalysesTab(i)),
                      ];
    for (let j=0;j < extra.TabCount;j++){
      tabContents.push((i)=>this.extraTab(i))
    }

    return (
      <div>
        <StructureEditorModal
          key={sample.id}
          showModal={this.state.showStructureEditor}
          onSave={this.handleStructureEditorSave.bind(this)}
          onCancel={this.handleStructureEditorCancel.bind(this)}
          molfile={molfile}
          />
        <Panel header="Sample Details" bsStyle={sample.isEdited ? 'info' : 'primary'}>
          <Button bsStyle="danger" bsSize="xsmall" className="button-right" onClick={this.closeDetails.bind(this)}>
            <i className="fa fa-times"></i>
          </Button>
          {this.sampleHeader(sample)}
          <ListGroup>
          <Tabs defaultActiveKey={0}>
            {tabContents.map((e,i)=>e(i))}
          </Tabs>
              <ListGroupItem>
                <ButtonToolbar>
                  <Button bsStyle="primary" onClick={this.closeDetails.bind(this)}>Close</Button>
                  <Button bsStyle="warning" onClick={this._submitFunction.bind(this)}
                          disabled={!sampleIsValid}>{this._submitLabel()}</Button>
                </ButtonToolbar>
              </ListGroupItem>
          </ListGroup>
        </Panel>
      </div>
    )
  }
}
