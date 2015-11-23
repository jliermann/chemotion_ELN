import alt from '../alt';
import ElementActions from '../actions/ElementActions';
import UIActions from '../actions/UIActions';
import UserActions from '../actions/UserActions';
import UIStore from './UIStore';
import ClipboardStore from './ClipboardStore';

import Sample from '../models/Sample';
import Reaction from '../models/Reaction';
import Wellplate from '../models/Wellplate';
import Screen from '../models/Screen';

class ElementStore {
  constructor() {
    this.state = {
      elements: {
        samples: {
          elements: [],
          totalElements: 0,
          page: null,
          pages: null,
          perPage: null
        },
        reactions: {
          elements: [],
          totalElements: 0,
          page: null,
          pages: null,
          perPage: null
        },
        wellplates: {
          elements: [],
          totalElements: 0,
          page: null,
          pages: null,
          perPage: null
        },
        screens: {
          elements: [],
          totalElements: 0,
          page: null,
          pages: null,
          perPage: null
        }
      },
      currentElement: null
    };

    this.bindListeners({
      handleFetchBasedOnSearchSelection: ElementActions.fetchBasedOnSearchSelectionAndCollection,
      handleFetchSampleById: ElementActions.fetchSampleById,
      handleFetchSamplesByCollectionId: ElementActions.fetchSamplesByCollectionId,
      handleUpdateSample: ElementActions.updateSample,
      handleCreateSample: ElementActions.createSample,
      handleCopySampleFromClipboard: ElementActions.copySampleFromClipboard,

      handleFetchReactionById: ElementActions.fetchReactionById,
      handleFetchReactionsByCollectionId: ElementActions.fetchReactionsByCollectionId,
      handleUpdateReaction: ElementActions.updateReaction,
      handleCreateReaction: ElementActions.createReaction,
      handleCopyReactionFromId: ElementActions.copyReactionFromId,

      handleFetchReactionSvgByMaterialsInchikeys: ElementActions.fetchReactionSvgByMaterialsInchikeys,
      handleFetchReactionSvgByReactionId: ElementActions.fetchReactionSvgByReactionId,

      handleFetchWellplateById: ElementActions.fetchWellplateById,
      handleFetchWellplatesByCollectionId: ElementActions.fetchWellplatesByCollectionId,
      handleUpdateWellplate: ElementActions.updateWellplate,
      handleCreateWellplate: ElementActions.createWellplate,
      handleGenerateWellplateFromClipboard: ElementActions.generateWellplateFromClipboard,
      handleGenerateScreenFromClipboard: ElementActions.generateScreenFromClipboard,

      handleFetchScreenById: ElementActions.fetchScreenById,
      handleFetchScreensByCollectionId: ElementActions.fetchScreensByCollectionId,
      handleUpdateScreen: ElementActions.updateScreen,
      handleCreateScreen: ElementActions.createScreen,

      handleUnselectCurrentElement: UIActions.deselectAllElements,
      // FIXME ElementStore listens to UIActions?
      handleSetPagination: UIActions.setPagination,
      handleRefreshElements: ElementActions.refreshElements,
      handleGenerateEmptyElement: [ElementActions.generateEmptyWellplate, ElementActions.generateEmptyScreen, ElementActions.generateEmptySample, ElementActions.generateEmptyReaction],
      handleFetchMoleculeByMolfile: ElementActions.fetchMoleculeByMolfile,
      handleDeleteElements: ElementActions.deleteElements,

      handleUpdateElementsCollection: ElementActions.updateElementsCollection,
      handleAssignElementsCollection: ElementActions.assignElementsCollection,
      handleRemoveElementsCollection: ElementActions.removeElementsCollection,
      handleSplitAsSubsamples: ElementActions.splitAsSubsamples
    })
  }

  handleFetchBasedOnSearchSelection(result) {
    Object.keys(result).forEach((key) => {
      this.state.elements[key] = result[key];
    });
  }

  closeElementWhenDeleted(ui_state) {
    let currentElement = this.state.currentElement;
    if (currentElement) {
      let type_state = ui_state[currentElement.type]
      let checked = type_state.checkedIds.indexOf(currentElement.id) > -1
      let checked_all_and_not_unchecked =
        type_state.checkedAll && type_state.uncheckedIds.indexOf(currentElement.id) == -1

      if (checked_all_and_not_unchecked || checked) {
        this.state.currentElement = null;
      }
    }
  }

  // -- Elements --
  handleDeleteElements(options) {
    const ui_state = UIStore.getState();

    ElementActions.deleteSamplesByUIState(ui_state);
    ElementActions.deleteReactionsByUIState({
      ui_state,
      options
    });
    ElementActions.deleteWellplatesByUIState(ui_state);
    ElementActions.deleteScreensByUIState(ui_state);
    ElementActions.fetchSamplesByCollectionId(ui_state.currentCollection.id);
    ElementActions.fetchReactionsByCollectionId(ui_state.currentCollection.id);
    ElementActions.fetchWellplatesByCollectionId(ui_state.currentCollection.id);
    ElementActions.fetchScreensByCollectionId(ui_state.currentCollection.id);
    this.closeElementWhenDeleted(ui_state);
  }

  handleUpdateElementsCollection(params) {
    let collection_id = params.ui_state.currentCollection.id
    ElementActions.fetchSamplesByCollectionId(collection_id);
    ElementActions.fetchReactionsByCollectionId(collection_id);
    ElementActions.fetchWellplatesByCollectionId(collection_id);
  }

  handleAssignElementsCollection(params) {
    let collection_id = params.ui_state.currentCollection.id
    ElementActions.fetchSamplesByCollectionId(collection_id);
    ElementActions.fetchReactionsByCollectionId(collection_id);
    ElementActions.fetchWellplatesByCollectionId(collection_id);
  }

  handleRemoveElementsCollection(params) {
    let collection_id = params.ui_state.currentCollection.id
    ElementActions.fetchSamplesByCollectionId(collection_id);
    ElementActions.fetchReactionsByCollectionId(collection_id);
    ElementActions.fetchWellplatesByCollectionId(collection_id);
  }

  // -- Samples --

  handleFetchSampleById(result) {
    this.state.currentElement = result;
  }

  handleFetchSamplesByCollectionId(result) {
    this.state.elements.samples = result;
  }

  // update stored sample if it has been updated
  handleUpdateSample(sample) {
    UserActions.fetchCurrentUser();

    this.state.currentElement = sample;
    this.handleRefreshElements('sample');
  }

  // Update Stored Sample if it has been created
  handleCreateSample(sample) {
    UserActions.fetchCurrentUser();

    this.handleRefreshElements('sample');
    this.navigateToNewElement(sample);
  }

  handleSplitAsSubsamples(ui_state) {
    ElementActions.fetchSamplesByCollectionId(ui_state.currentCollection.id);
  }

  // Molecules
  handleFetchMoleculeByMolfile(result) {
    // Attention: This is intended to update SampleDetails
    this.state.currentElement.molecule = result;
    this.handleRefreshElements('sample');
  }

  handleCopySampleFromClipboard(collection_id) {
    let clipboardSamples = ClipboardStore.getState().samples;

    this.state.currentElement = Sample.copyFromSampleAndCollectionId(clipboardSamples[0], collection_id)
  }

  // -- Wellplates --

  handleFetchWellplateById(result) {
    this.state.currentElement = result;
  }

  handleFetchWellplatesByCollectionId(result) {
    this.state.elements.wellplates = result;
  }

  handleUpdateWellplate(wellplate) {
    this.state.currentElement = wellplate;
    this.handleRefreshElements('wellplate');
    this.handleRefreshElements('sample');
  }

  handleCreateWellplate(wellplate) {
    this.handleRefreshElements('wellplate');
    this.navigateToNewElement(wellplate);
  }

  handleGenerateWellplateFromClipboard(collection_id) {
    let clipboardSamples = ClipboardStore.getState().samples;

    this.state.currentElement = Wellplate.buildFromSamplesAndCollectionId(clipboardSamples, collection_id);
  }
  // -- Screens --

  handleFetchScreenById(result) {
    this.state.currentElement = result;
  }

  handleFetchScreensByCollectionId(result) {
    this.state.elements.screens = result;
  }

  handleUpdateScreen(screen) {
    this.state.currentElement = screen;
    this.handleRefreshElements('screen');
  }

  handleCreateScreen(screen) {
    this.handleRefreshElements('screen');
    this.navigateToNewElement(screen);
  }

  handleGenerateScreenFromClipboard(collection_id) {
    let clipboardWellplates = ClipboardStore.getState().wellplates;

    this.state.currentElement = Screen.buildFromWellplatesAndCollectionId(clipboardWellplates, collection_id);
  }

  // -- Reactions --

  handleFetchReactionById(result) {
    this.state.currentElement = result;
  }

  handleFetchReactionsByCollectionId(result) {
    this.state.elements.reactions = result;
  }

  handleUpdateReaction(reaction) {
    this.state.currentElement = reaction;
    this.handleRefreshElements('reaction');
    this.handleRefreshElements('sample');
  }

  handleCreateReaction(reaction) {
    this.handleRefreshElements('reaction');
    this.navigateToNewElement(reaction);
  }

  handleCopyReactionFromId(reaction) {
    const uiState = UIStore.getState();
    this.state.currentElement = Reaction.copyFromReactionAndCollectionId(reaction, uiState.currentCollection.id);
  }

  // -- Reactions Literatures --

  handleCreateReactionLiterature(result) {
    this.state.currentElement.literatures.push(result);
  }

  handleDeleteReactionLiterature(reactionId) {
    ElementActions.fetchLiteraturesByReactionId(reactionId);
    this.handleRefreshElements('reaction');
  }

  handleFetchLiteraturesByReactionId(result) {
    this.state.currentElement.literatures = result.literatures;
  }

  // -- Reactions SVGs --

  handleFetchReactionSvgByMaterialsInchikeys(result) {
    this.state.currentElement.reaction_svg_file = result;
  }

  handleFetchReactionSvgByReactionId(result) {
    this.state.currentElement.reaction_svg_file = result;
  }

  // -- Generic --

  navigateToNewElement(element) {
    const uiState = UIStore.getState();
    Aviator.navigate(`/collection/${uiState.currentCollection.id}/${element.type}/${element.id}`);
  }

  handleGenerateEmptyElement(element) {
    let {currentElement} = this.state;

    const newElementOfSameTypeIsPresent = currentElement && currentElement.isNew && currentElement.type == element.type;
    if(!newElementOfSameTypeIsPresent) {
      this.state.currentElement = element;
    }
  }

  handleUnselectCurrentElement() {
    this.state.currentElement = null;
  }

  handleSetPagination(pagination) {
    this.waitFor(UIStore.dispatchToken);
    this.handleRefreshElements(pagination.type);
  }

  handleRefreshElements(type) {
    this.waitFor(UIStore.dispatchToken);
    let uiState = UIStore.getState();
    let page = uiState[type].page;

    this.state.elements[type+'s'].page = page;
    let currentSearchSelection = uiState.currentSearchSelection;

    // TODO if page changed -> fetch
    // if there is a currentSearchSelection we have to execute the respective action
    if(currentSearchSelection != null) {
      ElementActions.fetchBasedOnSearchSelectionAndCollection(currentSearchSelection, uiState.currentCollection.id, page);
    } else {
      switch (type) {
        case 'sample':
          ElementActions.fetchSamplesByCollectionId(uiState.currentCollection.id, {page: page, per_page: uiState.number_of_results});
          break;
        case 'reaction':
          ElementActions.fetchReactionsByCollectionId(uiState.currentCollection.id, {page: page, per_page: uiState.number_of_results});
          break;
        case 'wellplate':
          ElementActions.fetchWellplatesByCollectionId(uiState.currentCollection.id, {page: page, per_page: uiState.number_of_results});
          break;
        case 'screen':
          ElementActions.fetchScreensByCollectionId(uiState.currentCollection.id, {page: page, per_page: uiState.number_of_results});
          break;
      }
    }
  }
}

export default alt.createStore(ElementStore, 'ElementStore');
