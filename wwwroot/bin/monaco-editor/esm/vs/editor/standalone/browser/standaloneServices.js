/*---------------------------------------------------------------------------------------------
 *  Copyright (c) Microsoft Corporation. All rights reserved.
 *  Licensed under the MIT License. See License.txt in the project root for license information.
 *--------------------------------------------------------------------------------------------*/
'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
import { Disposable } from '../../../base/common/lifecycle.js';
import { IConfigurationService } from '../../../platform/configuration/common/configuration.js';
import { ContextMenuService } from '../../../platform/contextview/browser/contextMenuService.js';
import { IContextMenuService, IContextViewService } from '../../../platform/contextview/browser/contextView.js';
import { ContextViewService } from '../../../platform/contextview/browser/contextViewService.js';
import { createDecorator, IInstantiationService } from '../../../platform/instantiation/common/instantiation.js';
import { InstantiationService } from '../../../platform/instantiation/common/instantiationService.js';
import { ServiceCollection } from '../../../platform/instantiation/common/serviceCollection.js';
import { ICommandService } from '../../../platform/commands/common/commands.js';
import { IKeybindingService } from '../../../platform/keybinding/common/keybinding.js';
import { IContextKeyService } from '../../../platform/contextkey/common/contextkey.js';
import { MarkerService } from '../../../platform/markers/common/markerService.js';
import { IMarkerService } from '../../../platform/markers/common/markers.js';
import { IProgressService } from '../../../platform/progress/common/progress.js';
import { IStorageService, NullStorageService } from '../../../platform/storage/common/storage.js';
import { ITelemetryService } from '../../../platform/telemetry/common/telemetry.js';
import { IWorkspaceContextService } from '../../../platform/workspace/common/workspace.js';
import { ICodeEditorService } from '../../browser/services/codeEditorService.js';
import { IEditorWorkerService } from '../../common/services/editorWorkerService.js';
import { EditorWorkerServiceImpl } from '../../common/services/editorWorkerServiceImpl.js';
import { ITextResourceConfigurationService } from '../../common/services/resourceConfiguration.js';
import { IModeService } from '../../common/services/modeService.js';
import { ModeServiceImpl } from '../../common/services/modeServiceImpl.js';
import { IModelService } from '../../common/services/modelService.js';
import { ModelServiceImpl } from '../../common/services/modelServiceImpl.js';
import { CodeEditorServiceImpl } from '../../browser/services/codeEditorServiceImpl.js';
import { SimpleConfigurationService, SimpleResourceConfigurationService, SimpleMenuService, SimpleProgressService, StandaloneCommandService, StandaloneKeybindingService, SimpleNotificationService, StandaloneTelemetryService, SimpleWorkspaceContextService, SimpleDialogService } from './simpleServices.js';
import { ContextKeyService } from '../../../platform/contextkey/browser/contextKeyService.js';
import { IMenuService } from '../../../platform/actions/common/actions.js';
import { IStandaloneThemeService } from '../common/standaloneThemeService.js';
import { StandaloneThemeServiceImpl } from './standaloneThemeServiceImpl.js';
import { ILogService, NullLogService } from '../../../platform/log/common/log.js';
import { INotificationService } from '../../../platform/notification/common/notification.js';
import { IDialogService } from '../../../platform/dialogs/common/dialogs.js';
import { IListService, ListService } from '../../../platform/list/browser/listService.js';
export var StaticServices;
(function (StaticServices) {
    var _serviceCollection = new ServiceCollection();
    var LazyStaticService = /** @class */ (function () {
        function LazyStaticService(serviceId, factory) {
            this._serviceId = serviceId;
            this._factory = factory;
            this._value = null;
        }
        Object.defineProperty(LazyStaticService.prototype, "id", {
            get: function () { return this._serviceId; },
            enumerable: true,
            configurable: true
        });
        LazyStaticService.prototype.get = function (overrides) {
            if (!this._value) {
                if (overrides) {
                    this._value = overrides[this._serviceId.toString()];
                }
                if (!this._value) {
                    this._value = this._factory(overrides);
                }
                if (!this._value) {
                    throw new Error('Service ' + this._serviceId + ' is missing!');
                }
                _serviceCollection.set(this._serviceId, this._value);
            }
            return this._value;
        };
        return LazyStaticService;
    }());
    StaticServices.LazyStaticService = LazyStaticService;
    var _all = [];
    function define(serviceId, factory) {
        var r = new LazyStaticService(serviceId, factory);
        _all.push(r);
        return r;
    }
    function init(overrides) {
        // Create a fresh service collection
        var result = new ServiceCollection();
        // Initialize the service collection with the overrides
        for (var serviceId in overrides) {
            if (overrides.hasOwnProperty(serviceId)) {
                result.set(createDecorator(serviceId), overrides[serviceId]);
            }
        }
        // Make sure the same static services are present in all service collections
        _all.forEach(function (service) { return result.set(service.id, service.get(overrides)); });
        // Ensure the collection gets the correct instantiation service
        var instantiationService = new InstantiationService(result, true);
        result.set(IInstantiationService, instantiationService);
        return [result, instantiationService];
    }
    StaticServices.init = init;
    StaticServices.instantiationService = define(IInstantiationService, function () { return new InstantiationService(_serviceCollection, true); });
    var configurationServiceImpl = new SimpleConfigurationService();
    StaticServices.configurationService = define(IConfigurationService, function () { return configurationServiceImpl; });
    StaticServices.resourceConfigurationService = define(ITextResourceConfigurationService, function () { return new SimpleResourceConfigurationService(configurationServiceImpl); });
    StaticServices.contextService = define(IWorkspaceContextService, function () { return new SimpleWorkspaceContextService(); });
    StaticServices.telemetryService = define(ITelemetryService, function () { return new StandaloneTelemetryService(); });
    StaticServices.dialogService = define(IDialogService, function () { return new SimpleDialogService(); });
    StaticServices.notificationService = define(INotificationService, function () { return new SimpleNotificationService(); });
    StaticServices.markerService = define(IMarkerService, function () { return new MarkerService(); });
    StaticServices.modeService = define(IModeService, function (o) { return new ModeServiceImpl(); });
    StaticServices.modelService = define(IModelService, function (o) { return new ModelServiceImpl(StaticServices.markerService.get(o), StaticServices.configurationService.get(o)); });
    StaticServices.editorWorkerService = define(IEditorWorkerService, function (o) { return new EditorWorkerServiceImpl(StaticServices.modelService.get(o), StaticServices.resourceConfigurationService.get(o)); });
    StaticServices.standaloneThemeService = define(IStandaloneThemeService, function () { return new StandaloneThemeServiceImpl(); });
    StaticServices.codeEditorService = define(ICodeEditorService, function (o) { return new CodeEditorServiceImpl(StaticServices.standaloneThemeService.get(o)); });
    StaticServices.progressService = define(IProgressService, function () { return new SimpleProgressService(); });
    StaticServices.storageService = define(IStorageService, function () { return NullStorageService; });
    StaticServices.logService = define(ILogService, function () { return new NullLogService(); });
})(StaticServices || (StaticServices = {}));
var DynamicStandaloneServices = /** @class */ (function (_super) {
    __extends(DynamicStandaloneServices, _super);
    function DynamicStandaloneServices(domElement, overrides) {
        var _this = _super.call(this) || this;
        var _a = StaticServices.init(overrides), _serviceCollection = _a[0], _instantiationService = _a[1];
        _this._serviceCollection = _serviceCollection;
        _this._instantiationService = _instantiationService;
        var configurationService = _this.get(IConfigurationService);
        var notificationService = _this.get(INotificationService);
        var telemetryService = _this.get(ITelemetryService);
        var ensure = function (serviceId, factory) {
            var value = null;
            if (overrides) {
                value = overrides[serviceId.toString()];
            }
            if (!value) {
                value = factory();
            }
            _this._serviceCollection.set(serviceId, value);
            return value;
        };
        var contextKeyService = ensure(IContextKeyService, function () { return _this._register(new ContextKeyService(configurationService)); });
        ensure(IListService, function () { return new ListService(contextKeyService); });
        var commandService = ensure(ICommandService, function () { return new StandaloneCommandService(_this._instantiationService); });
        ensure(IKeybindingService, function () { return _this._register(new StandaloneKeybindingService(contextKeyService, commandService, telemetryService, notificationService, domElement)); });
        var contextViewService = ensure(IContextViewService, function () { return _this._register(new ContextViewService(domElement, telemetryService, new NullLogService())); });
        ensure(IContextMenuService, function () { return _this._register(new ContextMenuService(domElement, telemetryService, notificationService, contextViewService)); });
        ensure(IMenuService, function () { return new SimpleMenuService(commandService); });
        return _this;
    }
    DynamicStandaloneServices.prototype.get = function (serviceId) {
        var r = this._serviceCollection.get(serviceId);
        if (!r) {
            throw new Error('Missing service ' + serviceId);
        }
        return r;
    };
    DynamicStandaloneServices.prototype.set = function (serviceId, instance) {
        this._serviceCollection.set(serviceId, instance);
    };
    DynamicStandaloneServices.prototype.has = function (serviceId) {
        return this._serviceCollection.has(serviceId);
    };
    return DynamicStandaloneServices;
}(Disposable));
export { DynamicStandaloneServices };
